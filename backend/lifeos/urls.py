from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import TaskViewSet, HabitViewSet, GoalViewSet, ExpenseViewSet, BudgetViewSet, AnalyticsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='tasks')
router.register('habits', HabitViewSet, basename='habits')
router.register('goals', GoalViewSet, basename='goals')
router.register('expenses', ExpenseViewSet, basename='expenses')
router.register('budget', BudgetViewSet, basename='budget')

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/analytics/', AnalyticsView.as_view(), name='analytics'),
    path('api/', include(router.urls)),
]
