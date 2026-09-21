from django.db import migrations
from django.db.models import Count


def deduplicate_habit_completions(apps, schema_editor):
    """
    Finds and cleans all duplicate HabitCompletion records (same habit_id and date)
    prior to applying the unique constraint on (habit, date).
    
    Deterministic preservation strategy:
    1. Orders duplicates by created_at (earliest first), then by id.
    2. If any record in the group is completed (completed=True), marks the surviving record as completed=True.
    3. Retains the primary record and deletes all other duplicate records in the group.
    """
    db_alias = schema_editor.connection.alias
    HabitCompletion = apps.get_model('core', 'HabitCompletion')

    # Find all (habit_id, date) pairs with duplicate entries
    duplicate_groups = (
        HabitCompletion.objects.using(db_alias)
        .values('habit_id', 'date')
        .annotate(group_count=Count('id'))
        .filter(group_count__gt=1)
    )

    for dup in duplicate_groups:
        habit_id = dup['habit_id']
        date = dup['date']

        # Fetch all matching records deterministically
        records = list(
            HabitCompletion.objects.using(db_alias)
            .filter(habit_id=habit_id, date=date)
            .order_by('created_at', 'id')
        )

        if len(records) > 1:
            # Check if any completion record was marked true
            any_completed = any(r.completed for r in records)

            # Preserve the first (earliest) record
            primary_record = records[0]
            if primary_record.completed != any_completed:
                primary_record.completed = any_completed
                primary_record.save(using=db_alias, update_fields=['completed'])

            # Delete the remaining duplicate records
            duplicate_ids = [r.id for r in records[1:]]
            HabitCompletion.objects.using(db_alias).filter(id__in=duplicate_ids).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            deduplicate_habit_completions,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
