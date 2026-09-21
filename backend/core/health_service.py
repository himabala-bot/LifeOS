"""
Health & Nutrition Service
Calculates BMR, TDEE, Calorie/Macro targets, Hydration targets,
and computes Health Consistency metrics for LifeOS.
"""

from typing import Dict, Any, Optional

def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    biological_sex: str = 'male'
) -> float:
    """
    Mifflin-St Jeor Equation:
    Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
    Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
    """
    if weight_kg <= 0 or height_cm <= 0 or age <= 0:
        return 1600.0
        
    base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
    if biological_sex.lower() == 'female':
        return max(1000.0, round(base - 161.0, 1))
    return max(1200.0, round(base + 5.0, 1))


def calculate_tdee(bmr: float, activity_level: str = 'moderate') -> float:
    """
    Activity multipliers:
    sedentary: 1.2
    light: 1.375
    moderate: 1.55
    active: 1.725
    very_active: 1.9
    """
    multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9,
    }
    multiplier = multipliers.get(activity_level.lower(), 1.55)
    return round(bmr * multiplier, 1)


def calculate_health_targets(
    current_weight: float,
    goal_weight: float,
    height_cm: float,
    age: int,
    biological_sex: str = 'male',
    activity_level: str = 'moderate',
    training_focus: str = 'strength',
    training_frequency: int = 4
) -> Dict[str, Any]:
    """
    Generates recommended daily nutritional, hydration, and creatine targets.
    """
    bmr = calculate_bmr(current_weight, height_cm, age, biological_sex)
    tdee = calculate_tdee(bmr, activity_level)

    # Determine calorie surplus or deficit based on goal vs current weight
    if goal_weight > current_weight + 0.5:
        # Lean gaining surplus (~300-400 kcal)
        target_calories = int(round(tdee + 350))
    elif goal_weight < current_weight - 0.5:
        # Mild deficit (~400 kcal)
        target_calories = int(round(max(1400, tdee - 400)))
    else:
        # Maintenance
        target_calories = int(round(tdee))

    # Protein: 1.8g to 2.2g per kg of bodyweight for active strength training
    target_protein = int(round(current_weight * 2.0))

    # Fat: ~25-30% of total daily calories (9 kcal/g)
    fat_cals = target_calories * 0.25
    target_fat = int(round(fat_cals / 9.0))

    # Carbs: Remainder of calories (4 kcal/g)
    protein_cals = target_protein * 4.0
    remaining_cals = max(0, target_calories - protein_cals - fat_cals)
    target_carbs = int(round(remaining_cals / 4.0))

    # Water: 35-40ml per kg of bodyweight, rounded to nearest 250ml
    water_ml = int(round((current_weight * 38) / 250) * 250)
    target_water_ml = max(2000, min(4000, water_ml))

    return {
        'bmr': bmr,
        'tdee': tdee,
        'target_calories': target_calories,
        'target_protein': target_protein,
        'target_carbs': target_carbs,
        'target_fat': target_fat,
        'target_water_ml': target_water_ml,
        'creatine_target_g': 5,
    }


def calculate_health_consistency_score(
    nutrition_adherence: float,
    workout_completion: float,
    hydration_adherence: float,
    creatine_done: bool
) -> float:
    """
    Computes a composite Health Consistency score (0-100) based on actionable habits:
    - Nutrition target hit (35%)
    - Workout completed (35%)
    - Hydration target (20%)
    - Creatine completed (10%)
    """
    nut_score = min(100.0, max(0.0, nutrition_adherence)) * 0.35
    wko_score = min(100.0, max(0.0, workout_completion)) * 0.35
    hyd_score = min(100.0, max(0.0, hydration_adherence)) * 0.20
    crt_score = (100.0 if creatine_done else 0.0) * 0.10

    return round(nut_score + wko_score + hyd_score + crt_score, 1)
