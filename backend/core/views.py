from django.http import JsonResponse
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, CharField, EmailField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Sum
from .models import Goal, Task, Habit, HabitCompletion, Expense, MonthlyBudget


def health_check(request):
    """Simple unauthenticated health-check returning HTTP 200"""
    return JsonResponse({"status": "ok"}, status=200)






class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']


class TaskSerializer(ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class HabitCompletionSerializer(ModelSerializer):
    class Meta:
        model = HabitCompletion
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class HabitSerializer(ModelSerializer):
    completions = HabitCompletionSerializer(source='habitcompletion_set', many=True, read_only=True)

    class Meta:
        model = Habit
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class GoalSerializer(ModelSerializer):
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ExpenseSerializer(ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MonthlyBudgetSerializer(ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        budget = MonthlyBudget.objects.filter(user=self.user).first()
        user_data = UserSerializer(self.user).data
        user_data['monthly_budget'] = float(budget.amount) if budget else 25000
        data['user'] = user_data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer






class BaseUserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(BaseUserOwnedViewSet):
    model = Task
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related('goal').order_by('-created_at')


class HabitViewSet(BaseUserOwnedViewSet):
    model = Habit
    serializer_class = HabitSerializer

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).prefetch_related('habitcompletion_set').order_by('-created_at')


class HabitCompletionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HabitCompletionSerializer

    def get_queryset(self):
        return HabitCompletion.objects.filter(habit__user=self.request.user)

    def perform_create(self, serializer):

        habit = serializer.validated_data.get('habit')
        if habit and habit.user == self.request.user:
            serializer.save()
        else:
            raise permissions.PermissionDenied("Habit does not belong to you.")


class GoalViewSet(BaseUserOwnedViewSet):
    model = Goal
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by('-created_at')


class ExpenseViewSet(BaseUserOwnedViewSet):
    model = Expense
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-date', '-created_at')


class BudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MonthlyBudgetSerializer

    def get_queryset(self):
        return MonthlyBudget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        budget, _ = MonthlyBudget.objects.get_or_create(user=request.user, defaults={'amount': 25000})
        serializer = self.get_serializer(budget)
        return Response([serializer.data])






class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        name = request.data.get('name', '').strip()

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'An account with this username/email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email and User.objects.filter(email=email).exists():
            return Response(
                {'error': 'An account with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name
        )


        MonthlyBudget.objects.create(user=user, amount=25000)


        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        user_data['monthly_budget'] = 25000

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budget = MonthlyBudget.objects.filter(user=request.user).first()
        user_data = UserSerializer(request.user).data
        user_data['monthly_budget'] = float(budget.amount) if budget else 25000
        return Response(user_data)

    def patch(self, request):
        user = request.user
        if 'name' in request.data:
            user.first_name = request.data['name']
        if 'email' in request.data:
            user.email = request.data['email'].strip().lower()
        user.save()

        if 'monthly_budget' in request.data:
            MonthlyBudget.objects.update_or_create(
                user=user,
                defaults={'amount': request.data['monthly_budget']}
            )

        return self.get(request)






class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user)
        goals = Goal.objects.filter(user=request.user)
        expenses = Expense.objects.filter(user=request.user)
        habits = Habit.objects.filter(user=request.user, active=True)

        tasks_total = tasks.count()
        tasks_completed = tasks.filter(completed=True).count()

        spent_month = sum(x.amount for x in expenses)
        goal_progress = sum(x.progress for x in goals) / goals.count() if goals.exists() else 0
        habits_active = habits.count()

        return Response({
            'tasks_completed': tasks_completed,
            'tasks_total': tasks_total,
            'spent_month': float(spent_month),
            'goal_progress': round(goal_progress, 1),
            'habits_active': habits_active,
        })






class BootstrapView(APIView):
    """
    Returns complete workspace dataset in a single high-performance query/response,
    eliminating multiple sequential HTTP round-trips upon login/refresh.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user).select_related('goal').order_by('-created_at')
        habits = Habit.objects.filter(user=user).prefetch_related('habitcompletion_set').order_by('-created_at')
        goals = Goal.objects.filter(user=user).order_by('-created_at')
        expenses = Expense.objects.filter(user=user).order_by('-date', '-created_at')
        budget, _ = MonthlyBudget.objects.get_or_create(user=user, defaults={'amount': 25000})

        user_data = UserSerializer(user).data
        user_data['monthly_budget'] = float(budget.amount) if budget else 25000


        tasks_list = list(tasks)
        goals_list = list(goals)
        expenses_list = list(expenses)
        habits_list = list(habits)

        tasks_total = len(tasks_list)
        tasks_completed = sum(1 for t in tasks_list if t.completed)
        spent_month = sum(x.amount for x in expenses_list)
        goal_progress = sum(x.progress for x in goals_list) / len(goals_list) if goals_list else 0
        habits_active = sum(1 for h in habits_list if h.active)

        return Response({
            'user': user_data,
            'tasks': TaskSerializer(tasks_list, many=True).data,
            'habits': HabitSerializer(habits_list, many=True).data,
            'goals': GoalSerializer(goals_list, many=True).data,
            'expenses': ExpenseSerializer(expenses_list, many=True).data,
            'budget': MonthlyBudgetSerializer(budget).data,
            'analytics': {
                'tasks_completed': tasks_completed,
                'tasks_total': tasks_total,
                'spent_month': float(spent_month),
                'goal_progress': round(goal_progress, 1),
                'habits_active': habits_active,
            }
        })
