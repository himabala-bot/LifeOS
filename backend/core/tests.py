from datetime import date
from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Habit, HabitCompletion
from rest_framework.test import APIClient
from rest_framework import status


class HabitCompletionIdempotencyTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.habit = Habit.objects.create(user=self.user, name='Drink 2.5L Water')

    def test_idempotent_creation(self):
        target_date = '2026-09-07'

        # First toggle: completed = True
        res1 = self.client.post('/api/habit-completions/', {
            'habit': str(self.habit.id),
            'date': target_date,
            'completed': True
        })
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(HabitCompletion.objects.filter(habit=self.habit, date=target_date).count(), 1)
        self.assertTrue(HabitCompletion.objects.get(habit=self.habit, date=target_date).completed)

        # Second toggle: completed = False (same date, same habit)
        res2 = self.client.post('/api/habit-completions/', {
            'habit': str(self.habit.id),
            'date': target_date,
            'completed': False
        })
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        # Verify still exactly 1 record exists, and completed is now False
        self.assertEqual(HabitCompletion.objects.filter(habit=self.habit, date=target_date).count(), 1)
        self.assertFalse(HabitCompletion.objects.get(habit=self.habit, date=target_date).completed)

        # Third toggle: completed = True again
        res3 = self.client.post('/api/habit-completions/', {
            'habit': str(self.habit.id),
            'date': target_date,
            'completed': True
        })
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(HabitCompletion.objects.filter(habit=self.habit, date=target_date).count(), 1)
        self.assertTrue(HabitCompletion.objects.get(habit=self.habit, date=target_date).completed)
