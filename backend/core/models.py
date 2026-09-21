import uuid
from django.db import models
from django.contrib.auth.models import User


class Base(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Task(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, default='medium')
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Habit(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    frequency = models.CharField(max_length=20, default='daily')
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class HabitCompletion(Base):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.name} on {self.date}"


# ==========================================
# HEALTH & STRENGTH MODULE MODELS
# ==========================================

class HealthProfile(Base):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='health_profile')
    age = models.PositiveIntegerField(default=25)
    biological_sex = models.CharField(max_length=10, default='male')  # 'male' | 'female'
    height_cm = models.FloatField(default=175.0)
    current_weight = models.FloatField(default=68.0)
    goal_weight = models.FloatField(default=75.0)
    activity_level = models.CharField(max_length=20, default='moderate')  # 'sedentary', 'light', 'moderate', 'active', 'very_active'
    training_focus = models.CharField(max_length=30, default='hypertrophy')  # 'hypertrophy', 'strength', 'endurance', 'general_fitness'
    training_frequency = models.PositiveIntegerField(default=4)  # 3, 4, 5, 6
    
    # Nutritional & Hydration Targets (calculated or overridden)
    target_calories = models.PositiveIntegerField(default=2400)
    target_protein = models.PositiveIntegerField(default=140)  # grams
    target_carbs = models.PositiveIntegerField(default=280)    # grams
    target_fat = models.PositiveIntegerField(default=75)       # grams
    target_water_ml = models.PositiveIntegerField(default=3000)  # ml
    creatine_target_g = models.PositiveIntegerField(default=5)   # grams
    
    is_onboarded = models.BooleanField(default=False)

    def __str__(self):
        return f"HealthProfile({self.user.username})"


class Food(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='foods')
    name = models.CharField(max_length=200)
    serving_description = models.CharField(max_length=100, default='1 serving')  # e.g., "1 large egg", "100g cooked"
    calories = models.FloatField(default=0.0)
    protein = models.FloatField(default=0.0)  # grams
    carbs = models.FloatField(default=0.0)    # grams
    fat = models.FloatField(default=0.0)      # grams
    is_staple = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_staple', 'name']

    def __str__(self):
        return self.name


class FoodLog(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_logs')
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    servings = models.FloatField(default=1.0)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f"{self.servings}x {self.food.name} on {self.date}"


class DailyMeal(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_meals')
    name = models.CharField(max_length=250)
    meal_type = models.CharField(max_length=50, blank=True, default='Meal')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['date', 'order', 'created_at']

    def __str__(self):
        return f"{self.name} on {self.date} ({'Eaten' if self.completed else 'Planned'})"


class DailyWorkoutLog(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_workout_logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Workout on {self.date}: {'Done' if self.completed else 'Missed'}"


class WeightCheckin(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_checkins')
    date = models.DateField()
    weight = models.FloatField()
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.weight} kg on {self.date}"


class WorkoutPlan(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_plans')
    name = models.CharField(max_length=150, default='Main Routine')
    frequency = models.PositiveIntegerField(default=4)  # 3, 4, 5, 6
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.frequency}-day split)"


class WorkoutDay(Base):
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='days')
    day_name = models.CharField(max_length=100)  # e.g., 'Push', 'Pull', 'Legs', 'Upper', 'Rest'
    day_of_week = models.PositiveIntegerField(default=0)  # 0=Monday, 6=Sunday
    is_rest_day = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'day_of_week']

    def __str__(self):
        return f"{self.day_name} (Day {self.order})"


class Exercise(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_exercises')
    name = models.CharField(max_length=200)
    muscle_group = models.CharField(max_length=50)  # 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'

    class Meta:
        ordering = ['muscle_group', 'name']

    def __str__(self):
        return f"{self.name} ({self.muscle_group})"


class WorkoutExercise(Base):
    workout_day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    target_sets = models.PositiveIntegerField(default=3)
    target_reps = models.CharField(max_length=50, default='8-12')
    target_weight = models.FloatField(default=0.0)  # in kg

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} in {self.workout_day.day_name}"


class WorkoutLog(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_logs')
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    actual_sets = models.PositiveIntegerField(default=3)
    actual_reps = models.CharField(max_length=50, blank=True)
    actual_weight = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'workout_exercise', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.workout_exercise.exercise.name} log on {self.date}"


class DailyHealthStatus(Base):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_statuses')
    date = models.DateField()
    water_ml = models.PositiveIntegerField(default=0)
    creatine_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Health status on {self.date} for {self.user.username}"
