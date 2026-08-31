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
    RegisterView,
    MeView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='tasks')
router.register('habits', HabitViewSet, basename='habits')
router.register('habit-completions', HabitCompletionViewSet, basename='habit-completions')
router.register('goals', GoalViewSet, basename='goals')
router.register('expenses', ExpenseViewSet, basename='expenses')
router.register('budget', BudgetViewSet, basename='budget')

urlpatterns = [
    # Auth Endpoints
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),

    # Analytics Endpoint
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),

    # Resource ViewSets
    path('api/', include(router.urls)),
]
