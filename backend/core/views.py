import datetime
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, CharField, EmailField, SerializerMethodField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Task,
    Habit,
    HabitCompletion,
    HealthProfile,
    Food,
    FoodLog,
    WeightCheckin,
    WorkoutPlan,
    WorkoutDay,
    Exercise,
    WorkoutExercise,
    WorkoutLog,
    DailyHealthStatus,
)
from .health_service import (
    calculate_health_targets,
    calculate_health_consistency_score,
)


def health_check(request):
    """Simple unauthenticated health-check returning HTTP 200"""
    return JsonResponse({"status": "ok"}, status=200)


# ==========================================
# SERIALIZERS
# ==========================================

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


class HealthProfileSerializer(ModelSerializer):
    class Meta:
        model = HealthProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FoodSerializer(ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FoodLogSerializer(ModelSerializer):
    food_details = FoodSerializer(source='food', read_only=True)

    class Meta:
        model = FoodLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'logged_at', 'created_at', 'updated_at']


class WeightCheckinSerializer(ModelSerializer):
    class Meta:
        model = WeightCheckin
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ExerciseSerializer(ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WorkoutExerciseSerializer(ModelSerializer):
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkoutDaySerializer(ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutDay
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkoutPlanSerializer(ModelSerializer):
    days = WorkoutDaySerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutPlan
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WorkoutLogSerializer(ModelSerializer):
    class Meta:
        model = WorkoutLog
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class DailyHealthStatusSerializer(ModelSerializer):
    class Meta:
        model = DailyHealthStatus
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


# ==========================================
# AUTH VIEWS
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        profile, _ = HealthProfile.objects.get_or_create(user=self.user)
        user_data = UserSerializer(self.user).data
        user_data['health_profile'] = HealthProfileSerializer(profile).data
        data['user'] = user_data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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

        # Create default HealthProfile
        profile = HealthProfile.objects.create(user=user)

        # Seed initial staple foods for user
        initial_foods = [
            {'name': 'Whole Eggs', 'serving_description': '2 large eggs', 'calories': 140, 'protein': 12, 'carbs': 1, 'fat': 10, 'is_staple': True},
            {'name': 'Soya Chunks', 'serving_description': '50g uncooked', 'calories': 172, 'protein': 26, 'carbs': 16, 'fat': 0.5, 'is_staple': True},
            {'name': 'Banana', 'serving_description': '1 medium (120g)', 'calories': 105, 'protein': 1.3, 'carbs': 27, 'fat': 0.3, 'is_staple': True},
            {'name': 'Paneer / Cottage Cheese', 'serving_description': '100g', 'calories': 265, 'protein': 18, 'carbs': 3, 'fat': 20, 'is_staple': True},
            {'name': 'Almonds & Cashews', 'serving_description': '30g mix', 'calories': 175, 'protein': 5, 'carbs': 8, 'fat': 15, 'is_staple': True},
            {'name': 'Balanced Meal', 'serving_description': 'Rice, Dal, Veggies', 'calories': 550, 'protein': 18, 'carbs': 90, 'fat': 12, 'is_staple': True},
        ]
        for f in initial_foods:
            Food.objects.create(user=user, **f)

        # Seed standard workout routine (4-day Push/Pull/Legs/Upper split)
        seed_default_workout_plan(user, frequency=4)

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        user_data['health_profile'] = HealthProfileSerializer(profile).data

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = HealthProfile.objects.get_or_create(user=request.user)
        user_data = UserSerializer(request.user).data
        user_data['health_profile'] = HealthProfileSerializer(profile).data
        return Response(user_data)

    def patch(self, request):
        user = request.user
        if 'name' in request.data:
            user.first_name = request.data['name']
        if 'email' in request.data:
            user.email = request.data['email'].strip().lower()
        user.save()
        return self.get(request)


# ==========================================
# BASE USER OWNED VIEWSETS
# ==========================================

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
        return Task.objects.filter(user=self.request.user).order_by('-created_at')


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

    def create(self, request, *args, **kwargs):
        habit_id = request.data.get('habit')
        date = request.data.get('date')
        completed = request.data.get('completed', True)
        if not habit_id or not date:
            return Response({"error": "habit and date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            habit = Habit.objects.get(id=habit_id, user=request.user)
        except Habit.DoesNotExist:
            return Response({"error": "Habit not found or does not belong to you."}, status=status.HTTP_404_NOT_FOUND)

        instance, created = HabitCompletion.objects.update_or_create(
            habit=habit,
            date=date,
            defaults={'completed': completed}
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# ==========================================
# HEALTH & STRENGTH VIEWSETS
# ==========================================

class HealthProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthProfileSerializer

    def get_queryset(self):
        return HealthProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HealthOnboardingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        current_weight = float(data.get('current_weight', 68.0))
        goal_weight = float(data.get('goal_weight', 75.0))
        height_cm = float(data.get('height_cm', 175.0))
        age = int(data.get('age', 25))
        biological_sex = str(data.get('biological_sex', 'male')).lower()
        activity_level = str(data.get('activity_level', 'moderate'))
        training_focus = str(data.get('training_focus', 'hypertrophy'))
        training_frequency = int(data.get('training_frequency', 4))

        # Calculate targets automatically using service
        targets = calculate_health_targets(
            current_weight=current_weight,
            goal_weight=goal_weight,
            height_cm=height_cm,
            age=age,
            biological_sex=biological_sex,
            activity_level=activity_level,
            training_focus=training_focus,
            training_frequency=training_frequency
        )

        # Allow user overrides if provided
        target_calories = int(data.get('target_calories') or targets['target_calories'])
        target_protein = int(data.get('target_protein') or targets['target_protein'])
        target_carbs = int(data.get('target_carbs') or targets['target_carbs'])
        target_fat = int(data.get('target_fat') or targets['target_fat'])
        target_water_ml = int(data.get('target_water_ml') or targets['target_water_ml'])

        profile, _ = HealthProfile.objects.update_or_create(
            user=user,
            defaults={
                'age': age,
                'biological_sex': biological_sex,
                'height_cm': height_cm,
                'current_weight': current_weight,
                'goal_weight': goal_weight,
                'activity_level': activity_level,
                'training_focus': training_focus,
                'training_frequency': training_frequency,
                'target_calories': target_calories,
                'target_protein': target_protein,
                'target_carbs': target_carbs,
                'target_fat': target_fat,
                'target_water_ml': target_water_ml,
                'creatine_target_g': 5,
                'is_onboarded': True,
            }
        )

        # Create or update weight check-in for today
        today = timezone.localdate()
        WeightCheckin.objects.update_or_create(
            user=user,
            date=today,
            defaults={'weight': current_weight}
        )

        # Build workout plan matching selected frequency
        seed_default_workout_plan(user, frequency=training_frequency)

        return Response(HealthProfileSerializer(profile).data, status=status.HTTP_200_OK)


class FoodViewSet(BaseUserOwnedViewSet):
    model = Food
    serializer_class = FoodSerializer

    def get_queryset(self):
        return Food.objects.filter(user=self.request.user)


class FoodLogViewSet(BaseUserOwnedViewSet):
    model = FoodLog
    serializer_class = FoodLogSerializer

    def get_queryset(self):
        qs = FoodLog.objects.filter(user=self.request.user).select_related('food')
        date_param = self.request.query_params.get('date')
        if date_param:
            qs = qs.filter(date=date_param)
        return qs.order_by('-logged_at')


class WeightCheckinViewSet(BaseUserOwnedViewSet):
    model = WeightCheckin
    serializer_class = WeightCheckinSerializer

    def get_queryset(self):
        return WeightCheckin.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        checkin = serializer.save(user=self.request.user)
        # Update current weight on health profile
        profile, _ = HealthProfile.objects.get_or_create(user=self.request.user)
        profile.current_weight = checkin.weight
        profile.save(update_fields=['current_weight'])


class WorkoutPlanViewSet(BaseUserOwnedViewSet):
    model = WorkoutPlan
    serializer_class = WorkoutPlanSerializer

    def get_queryset(self):
        return WorkoutPlan.objects.filter(user=self.request.user).prefetch_related('days__exercises__exercise')


class WorkoutDayViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkoutDaySerializer

    def get_queryset(self):
        return WorkoutDay.objects.filter(plan__user=self.request.user).prefetch_related('exercises__exercise')


class ExerciseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        return Exercise.objects.filter(Q(user=self.request.user) | Q(user__isnull=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutExerciseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkoutExerciseSerializer

    def get_queryset(self):
        return WorkoutExercise.objects.filter(workout_day__plan__user=self.request.user).select_related('exercise')


class WorkoutLogViewSet(BaseUserOwnedViewSet):
    model = WorkoutLog
    serializer_class = WorkoutLogSerializer

    def get_queryset(self):
        qs = WorkoutLog.objects.filter(user=self.request.user).select_related('workout_exercise__exercise')
        date_param = self.request.query_params.get('date')
        if date_param:
            qs = qs.filter(date=date_param)
        return qs


class DailyHealthStatusViewSet(BaseUserOwnedViewSet):
    model = DailyHealthStatus
    serializer_class = DailyHealthStatusSerializer

    def get_queryset(self):
        return DailyHealthStatus.objects.filter(user=self.request.user)


# ==========================================
# SEED ROUTINE HELPER
# ==========================================

def seed_default_workout_plan(user, frequency=4):
    """Creates a structured workout plan and exercises for the user."""
    # Ensure standard exercises exist
    exercises_data = [
        ('Barbell Bench Press', 'Chest'),
        ('Incline Dumbbell Press', 'Chest'),
        ('Overhead Shoulder Press', 'Shoulders'),
        ('Lateral Raises', 'Shoulders'),
        ('Tricep Rope Pushdown', 'Arms'),
        ('Barbell Bar Deadlift', 'Back'),
        ('Lat Pulldown', 'Back'),
        ('Seated Cable Row', 'Back'),
        ('Bicep Dumbbell Curl', 'Arms'),
        ('Hammer Curls', 'Arms'),
        ('Barbell Back Squat', 'Legs'),
        ('Romanian Deadlift', 'Legs'),
        ('Leg Press', 'Legs'),
        ('Standing Calf Raises', 'Legs'),
        ('Hanging Leg Raises', 'Core'),
    ]

    exercise_objs = {}
    for name, group in exercises_data:
        ex, _ = Exercise.objects.get_or_create(user=user, name=name, defaults={'muscle_group': group})
        exercise_objs[name] = ex

    WorkoutPlan.objects.filter(user=user).update(is_active=False)
    plan = WorkoutPlan.objects.create(
        user=user,
        name=f"{frequency}-Day Strength Split",
        frequency=frequency,
        is_active=True
    )

    if frequency == 3:
        # Full Body A / B / C
        days = [
            ('Full Body A', 0, False, [
                (exercise_objs['Barbell Back Squat'], 3, '6-8', 60),
                (exercise_objs['Barbell Bench Press'], 3, '8-10', 50),
                (exercise_objs['Seated Cable Row'], 3, '10-12', 45),
                (exercise_objs['Overhead Shoulder Press'], 3, '8-10', 30),
            ]),
            ('Full Body B', 2, False, [
                (exercise_objs['Barbell Bar Deadlift'], 3, '5', 80),
                (exercise_objs['Incline Dumbbell Press'], 3, '8-10', 22),
                (exercise_objs['Lat Pulldown'], 3, '10-12', 50),
                (exercise_objs['Bicep Dumbbell Curl'], 3, '12', 12),
            ]),
            ('Full Body C', 4, False, [
                (exercise_objs['Leg Press'], 3, '10-12', 120),
                (exercise_objs['Barbell Bench Press'], 3, '8-10', 52.5),
                (exercise_objs['Lateral Raises'], 4, '15', 8),
                (exercise_objs['Tricep Rope Pushdown'], 3, '12-15', 20),
            ]),
        ]
    elif frequency == 4:
        # Push / Pull / Legs / Upper
        days = [
            ('Push (Chest, Delts, Triceps)', 0, False, [
                (exercise_objs['Barbell Bench Press'], 3, '6-8', 55),
                (exercise_objs['Incline Dumbbell Press'], 3, '8-10', 22),
                (exercise_objs['Overhead Shoulder Press'], 3, '8-10', 32.5),
                (exercise_objs['Lateral Raises'], 4, '12-15', 8),
                (exercise_objs['Tricep Rope Pushdown'], 3, '12-15', 22.5),
            ]),
            ('Pull (Back, Biceps, Rear Delts)', 1, False, [
                (exercise_objs['Lat Pulldown'], 3, '8-10', 55),
                (exercise_objs['Seated Cable Row'], 3, '10-12', 50),
                (exercise_objs['Bicep Dumbbell Curl'], 3, '10-12', 14),
                (exercise_objs['Hammer Curls'], 3, '12', 12),
            ]),
            ('Legs & Core', 3, False, [
                (exercise_objs['Barbell Back Squat'], 4, '6-8', 70),
                (exercise_objs['Romanian Deadlift'], 3, '8-10', 60),
                (exercise_objs['Leg Press'], 3, '12', 140),
                (exercise_objs['Standing Calf Raises'], 4, '15', 40),
                (exercise_objs['Hanging Leg Raises'], 3, '15', 0),
            ]),
            ('Upper Power & Hypertrophy', 4, False, [
                (exercise_objs['Barbell Bench Press'], 3, '5', 60),
                (exercise_objs['Barbell Bar Deadlift'], 3, '5', 85),
                (exercise_objs['Incline Dumbbell Press'], 3, '8', 24),
                (exercise_objs['Lateral Raises'], 3, '15', 9),
            ]),
        ]
    elif frequency == 5:
        # Upper / Lower / Push / Pull / Legs
        days = [
            ('Upper Body A', 0, False, [
                (exercise_objs['Barbell Bench Press'], 3, '6-8', 55),
                (exercise_objs['Lat Pulldown'], 3, '8-10', 55),
                (exercise_objs['Overhead Shoulder Press'], 3, '8-10', 30),
            ]),
            ('Lower Body A', 1, False, [
                (exercise_objs['Barbell Back Squat'], 4, '6-8', 70),
                (exercise_objs['Romanian Deadlift'], 3, '8-10', 60),
                (exercise_objs['Standing Calf Raises'], 3, '15', 40),
            ]),
            ('Push B', 3, False, [
                (exercise_objs['Incline Dumbbell Press'], 3, '8-10', 22),
                (exercise_objs['Lateral Raises'], 4, '15', 8),
                (exercise_objs['Tricep Rope Pushdown'], 3, '12', 20),
            ]),
            ('Pull B', 4, False, [
                (exercise_objs['Seated Cable Row'], 3, '10', 50),
                (exercise_objs['Bicep Dumbbell Curl'], 3, '12', 12),
                (exercise_objs['Hammer Curls'], 3, '12', 12),
            ]),
            ('Legs B', 5, False, [
                (exercise_objs['Leg Press'], 3, '12', 130),
                (exercise_objs['Hanging Leg Raises'], 3, '15', 0),
            ]),
        ]
    else:  # 6 days PPL x 2
        days = [
            ('Push A', 0, False, [(exercise_objs['Barbell Bench Press'], 3, '6-8', 55), (exercise_objs['Lateral Raises'], 4, '15', 8)]),
            ('Pull A', 1, False, [(exercise_objs['Lat Pulldown'], 3, '8-10', 55), (exercise_objs['Bicep Dumbbell Curl'], 3, '12', 12)]),
            ('Legs A', 2, False, [(exercise_objs['Barbell Back Squat'], 3, '8', 70), (exercise_objs['Standing Calf Raises'], 3, '15', 40)]),
            ('Push B', 3, False, [(exercise_objs['Incline Dumbbell Press'], 3, '8-10', 22), (exercise_objs['Tricep Rope Pushdown'], 3, '12', 20)]),
            ('Pull B', 4, False, [(exercise_objs['Seated Cable Row'], 3, '10', 50), (exercise_objs['Hammer Curls'], 3, '12', 12)]),
            ('Legs B', 5, False, [(exercise_objs['Romanian Deadlift'], 3, '8', 60), (exercise_objs['Leg Press'], 3, '12', 130)]),
        ]

    for order, (day_name, dow, is_rest, exercises_list) in enumerate(days):
        w_day = WorkoutDay.objects.create(
            plan=plan,
            day_name=day_name,
            day_of_week=dow,
            is_rest_day=is_rest,
            order=order
        )
        for ex_order, (ex_obj, sets, reps, weight) in enumerate(exercises_list):
            WorkoutExercise.objects.create(
                workout_day=w_day,
                exercise=ex_obj,
                order=ex_order,
                target_sets=sets,
                target_reps=reps,
                target_weight=weight
            )


# ==========================================
# BOOTSTRAP VIEW
# ==========================================

class BootstrapView(APIView):
    """
    Returns complete workspace dataset in a single high-performance response,
    eliminating sequential HTTP round-trips upon login/refresh.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        # 1. Base LifeOS Entities
        tasks = list(Task.objects.filter(user=user).order_by('-created_at'))
        habits = list(Habit.objects.filter(user=user).prefetch_related('habitcompletion_set').order_by('-created_at'))

        # 2. Health Entities
        profile, _ = HealthProfile.objects.get_or_create(user=user)
        foods = list(Food.objects.filter(user=user))
        today_food_logs = list(FoodLog.objects.filter(user=user, date=today).select_related('food'))
        weight_checkins = list(WeightCheckin.objects.filter(user=user).order_by('-date')[:30])
        daily_status, _ = DailyHealthStatus.objects.get_or_create(user=user, date=today)

        # Active workout plan and today's workout
        active_plan = WorkoutPlan.objects.filter(user=user, is_active=True).prefetch_related('days__exercises__exercise').first()
        today_dow = today.weekday()  # 0=Monday
        today_workout_day = None
        if active_plan:
            # Match day of week or closest day
            today_workout_day = active_plan.days.filter(day_of_week=today_dow).first()
            if not today_workout_day and active_plan.days.exists():
                # Fallback to day modulo count
                day_count = active_plan.days.count()
                if day_count > 0:
                    today_workout_day = active_plan.days.all()[today_dow % day_count]

        today_workout_logs = list(WorkoutLog.objects.filter(user=user, date=today).select_related('workout_exercise__exercise'))

        # 3. Macro Calculations for Today
        total_cals = 0.0
        total_prot = 0.0
        total_carbs = 0.0
        total_fat = 0.0
        for log in today_food_logs:
            s = float(log.servings)
            total_cals += float(log.food.calories) * s
            total_prot += float(log.food.protein) * s
            total_carbs += float(log.food.carbs) * s
            total_fat += float(log.food.fat) * s

        # 4. LifeScore Calculation (3 Pillars: Tasks, Habits, Health)
        tasks_total = len(tasks)
        tasks_completed = sum(1 for t in tasks if t.completed)
        task_score = (tasks_completed / tasks_total * 100.0) if tasks_total > 0 else 85.0

        # Habit score: % completed today or overall consistency
        habits_active = [h for h in habits if h.active]
        habit_count = len(habits_active)
        habit_completions_today = 0
        for h in habits_active:
            if any(c.date == today and c.completed for c in h.habitcompletion_set.all()):
                habit_completions_today += 1
        habit_score = (habit_completions_today / habit_count * 100.0) if habit_count > 0 else 80.0

        # Health Consistency Score
        nutrition_adh = min(100.0, (total_cals / profile.target_calories * 100.0)) if profile.target_calories > 0 else 0
        # Workout completion
        workout_exercises_today = today_workout_day.exercises.count() if today_workout_day else 0
        workout_done_today = sum(1 for wl in today_workout_logs if wl.completed)
        workout_adh = (workout_done_today / workout_exercises_today * 100.0) if workout_exercises_today > 0 else 100.0
        # Hydration
        hydration_adh = min(100.0, (daily_status.water_ml / profile.target_water_ml * 100.0)) if profile.target_water_ml > 0 else 0

        health_score = calculate_health_consistency_score(
            nutrition_adherence=nutrition_adh,
            workout_completion=workout_adh,
            hydration_adherence=hydration_adh,
            creatine_done=daily_status.creatine_completed
        )

        overall_lifescore = round((task_score * 0.35) + (habit_score * 0.35) + (health_score * 0.30), 1)

        user_data = UserSerializer(user).data
        user_data['health_profile'] = HealthProfileSerializer(profile).data

        return Response({
            'user': user_data,
            'tasks': TaskSerializer(tasks, many=True).data,
            'habits': HabitSerializer(habits, many=True).data,
            'health_profile': HealthProfileSerializer(profile).data,
            'foods': FoodSerializer(foods, many=True).data,
            'food_logs_today': FoodLogSerializer(today_food_logs, many=True).data,
            'weight_checkins': WeightCheckinSerializer(weight_checkins, many=True).data,
            'workout_plan': WorkoutPlanSerializer(active_plan).data if active_plan else None,
            'today_workout_day': WorkoutDaySerializer(today_workout_day).data if today_workout_day else None,
            'today_workout_logs': WorkoutLogSerializer(today_workout_logs, many=True).data,
            'daily_health_status': DailyHealthStatusSerializer(daily_status).data,
            'today_macros': {
                'calories': round(total_cals, 1),
                'protein': round(total_prot, 1),
                'carbs': round(total_carbs, 1),
                'fat': round(total_fat, 1),
                'target_calories': profile.target_calories,
                'target_protein': profile.target_protein,
                'target_carbs': profile.target_carbs,
                'target_fat': profile.target_fat,
            },
            'lifescore': {
                'overall': overall_lifescore,
                'tasks_score': round(task_score, 1),
                'habits_score': round(habit_score, 1),
                'health_score': round(health_score, 1),
                'summary': "Balanced productivity and physical consistency across core life domains.",
                'change_vs_last_week': 2.4,
            },
            'analytics': {
                'tasks_completed': tasks_completed,
                'tasks_total': tasks_total,
                'habits_active': habit_count,
                'health_consistency': health_score,
                'current_weight': profile.current_weight,
                'goal_weight': profile.goal_weight,
            }
        })


# ==========================================
# ANALYTICS VIEW
# ==========================================

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        tasks = Task.objects.filter(user=user)
        habits = Habit.objects.filter(user=user, active=True)
        profile, _ = HealthProfile.objects.get_or_create(user=user)

        # 7-day Health and Nutrition data
        seven_days_ago = today - datetime.timedelta(days=6)
        recent_food_logs = FoodLog.objects.filter(user=user, date__gte=seven_days_ago).select_related('food')
        recent_checkins = WeightCheckin.objects.filter(user=user, date__gte=seven_days_ago)
        recent_statuses = DailyHealthStatus.objects.filter(user=user, date__gte=seven_days_ago)
        recent_workout_logs = WorkoutLog.objects.filter(user=user, date__gte=seven_days_ago)

        # Build day-by-day health history for charts
        history = []
        for i in range(7):
            d = seven_days_ago + datetime.timedelta(days=i)
            day_logs = [l for l in recent_food_logs if l.date == d]
            day_cals = sum(float(l.food.calories) * float(l.servings) for l in day_logs)
            day_prot = sum(float(l.food.protein) * float(l.servings) for l in day_logs)
            day_status = next((s for s in recent_statuses if s.date == d), None)
            water = day_status.water_ml if day_status else 0
            w_logs = [wl for wl in recent_workout_logs if wl.date == d]
            w_completed = sum(1 for wl in w_logs if wl.completed)

            history.append({
                'date': d.strftime('%Y-%m-%d'),
                'day': d.strftime('%a'),
                'calories': round(day_cals, 0),
                'protein': round(day_prot, 0),
                'water_ml': water,
                'target_calories': profile.target_calories,
                'target_protein': profile.target_protein,
                'exercises_completed': w_completed
            })

        tasks_total = tasks.count()
        tasks_completed = tasks.filter(completed=True).count()

        return Response({
            'tasks_completed': tasks_completed,
            'tasks_total': tasks_total,
            'habits_active': habits.count(),
            'current_weight': profile.current_weight,
            'goal_weight': profile.goal_weight,
            'history': history,
        })
