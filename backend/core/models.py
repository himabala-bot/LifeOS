import uuid
from django.db import models
from django.contrib.auth.models import User
class Base(models.Model):
 id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False);created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)
 class Meta: abstract=True
class Goal(Base): user=models.ForeignKey(User,on_delete=models.CASCADE);title=models.CharField(max_length=200);description=models.TextField(blank=True);deadline=models.DateField(null=True,blank=True);status=models.CharField(max_length=20,default='active');progress=models.PositiveIntegerField(default=0)
class Task(Base): user=models.ForeignKey(User,on_delete=models.CASCADE);goal=models.ForeignKey(Goal,null=True,blank=True,on_delete=models.SET_NULL);title=models.CharField(max_length=200);description=models.TextField(blank=True);priority=models.CharField(max_length=10,default='medium');due_date=models.DateField(null=True,blank=True);completed=models.BooleanField(default=False)
class Habit(Base): user=models.ForeignKey(User,on_delete=models.CASCADE);goal=models.ForeignKey(Goal,null=True,blank=True,on_delete=models.SET_NULL);name=models.CharField(max_length=200);frequency=models.CharField(max_length=20,default='daily');active=models.BooleanField(default=True)
class HabitCompletion(Base): habit=models.ForeignKey(Habit,on_delete=models.CASCADE);date=models.DateField();completed=models.BooleanField(default=True)
class Expense(Base): user=models.ForeignKey(User,on_delete=models.CASCADE);amount=models.DecimalField(max_digits=10,decimal_places=2);title=models.CharField(max_length=200);category=models.CharField(max_length=30);date=models.DateField()
class MonthlyBudget(Base): user=models.OneToOneField(User,on_delete=models.CASCADE);amount=models.DecimalField(max_digits=10,decimal_places=2,default=25000)
