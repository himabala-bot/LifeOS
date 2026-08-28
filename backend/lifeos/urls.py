from django.urls import path,include
from rest_framework.routers import DefaultRouter
from core.views import *
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
r=DefaultRouter()
for p,c in [('tasks',TaskViewSet),('habits',HabitViewSet),('goals',GoalViewSet),('expenses',ExpenseViewSet),('budget',BudgetViewSet)]: r.register(p,c)
urlpatterns=[path('api/token/',TokenObtainPairView.as_view()),path('api/token/refresh/',TokenRefreshView.as_view()),path('api/analytics/',AnalyticsView.as_view()),path('api/',include(r.urls))]
