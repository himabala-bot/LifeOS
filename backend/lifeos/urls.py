from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    TaskViewSet,
    HabitViewSet,
    HabitCompletionViewSet,
    GoalViewSet,
    ExpenseViewSet,
    BudgetViewSet,
    AnalyticsView,
    BootstrapView,
    RegisterView,
    MeView,
    CustomTokenObtainPairView,
    health_check,
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='tasks')
router.register('habits', HabitViewSet, basename='habits')
router.register('habit-completions', HabitCompletionViewSet, basename='habit-completions')
router.register('goals', GoalViewSet, basename='goals')
router.register('expenses', ExpenseViewSet, basename='expenses')
router.register('budget', BudgetViewSet, basename='budget')

urlpatterns = [

    path('health/', health_check, name='health_check'),
    path('healthz/', health_check, name='healthz'),
    path('', health_check, name='root_health_check'),


    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),


    path('api/bootstrap/', BootstrapView.as_view(), name='bootstrap'),


    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),


    path('api/', include(router.urls)),
]

