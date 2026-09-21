from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    TaskViewSet,
    HabitViewSet,
    HabitCompletionViewSet,
    GoalViewSet,
    HealthProfileViewSet,
    FoodViewSet,
    FoodLogViewSet,
    WeightCheckinViewSet,
    WorkoutPlanViewSet,
    WorkoutDayViewSet,
    ExerciseViewSet,
    WorkoutExerciseViewSet,
    WorkoutLogViewSet,
    DailyHealthStatusViewSet,
    HealthOnboardingView,
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

# Health & Strength endpoints
router.register('health/profile', HealthProfileViewSet, basename='health-profile')
router.register('health/foods', FoodViewSet, basename='health-foods')
router.register('health/food-logs', FoodLogViewSet, basename='health-food-logs')
router.register('health/weight', WeightCheckinViewSet, basename='health-weight')
router.register('health/workout-plans', WorkoutPlanViewSet, basename='health-workout-plans')
router.register('health/workout-days', WorkoutDayViewSet, basename='health-workout-days')
router.register('health/exercises', ExerciseViewSet, basename='health-exercises')
router.register('health/workout-exercises', WorkoutExerciseViewSet, basename='health-workout-exercises')
router.register('health/workout-logs', WorkoutLogViewSet, basename='health-workout-logs')
router.register('health/daily-status', DailyHealthStatusViewSet, basename='health-daily-status')

urlpatterns = [
    # Health checks
    path('health/', health_check, name='health_check'),
    path('healthz/', health_check, name='healthz'),
    path('', health_check, name='root_health_check'),

    # Auth
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),

    # Health Onboarding / Targets calculation
    path('api/health/onboard/', HealthOnboardingView.as_view(), name='health_onboard'),

    # Consolidated high-performance Bootstrap & Analytics
    path('api/bootstrap/', BootstrapView.as_view(), name='bootstrap'),
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),

    # REST Router
    path('api/', include(router.urls)),
]
