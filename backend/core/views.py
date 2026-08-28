from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from .models import *
def ser(m): return type(m.__name__+'Serializer',(ModelSerializer,),{'Meta':type('Meta',(),{'model':m,'fields':'__all__'})})
class Owned(viewsets.ModelViewSet):
 def get_queryset(self): return self.model.objects.filter(user=self.request.user)
 def perform_create(self,s): s.save(user=self.request.user)
def make(m): return type(m.__name__+'ViewSet',(Owned,),{'model':m,'serializer_class':ser(m)})
TaskViewSet=make(Task);HabitViewSet=make(Habit);GoalViewSet=make(Goal);ExpenseViewSet=make(Expense);BudgetViewSet=make(MonthlyBudget)
class AnalyticsView(APIView):
 def get(self,request):
  t=Task.objects.filter(user=request.user);g=Goal.objects.filter(user=request.user);e=Expense.objects.filter(user=request.user)
  return Response({'tasks_completed':t.filter(completed=True).count(),'tasks_total':t.count(),'spent_month':sum(x.amount for x in e),'goal_progress':sum(x.progress for x in g)/g.count() if g.exists() else 0})
