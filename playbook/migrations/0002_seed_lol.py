"""
Seed three example PlaybookEntries for Limitation of Liability so the admin
isn't empty on first run. Delete these via the admin once you have your own.
"""

from django.db import migrations


SEED_FAMILY = "Limitation of Liability"
SEED_SUB = "General cap"

SEED_ENTRIES = [
    {
        "tier": "ideal",
        "position_description": (
            "Aggregate liability for each party capped at 12 months of fees paid "
            "in the 12 months preceding the event giving rise to the claim. "
            "Mutual cap. Standard exclusions for confidentiality breach, "
            "IP indemnity, and gross negligence / wilful misconduct."
        ),
        "approval_level_required": "self",
        "rationale": (
            "12-month fees cap is market for mid-market SaaS. Mutual cap keeps "
            "negotiation symmetric and avoids precedent for one-sided liability."
        ),
    },
    {
        "tier": "acceptable",
        "position_description": (
            "Aggregate liability capped at 24 months of fees paid in the 24 months "
            "preceding the claim. Same exclusions as ideal tier."
        ),
        "approval_level_required": "senior_counsel",
        "rationale": (
            "Acceptable when counterparty is enterprise and deal value justifies "
            "the additional exposure. Still well within insured limits."
        ),
    },
    {
        "tier": "fallback_1",
        "position_description": (
            "Aggregate liability capped at 2x annual fees. Confidentiality breach "
            "carved out up to a separate super-cap of 3x annual fees. IP indemnity "
            "and gross negligence remain uncapped."
        ),
        "approval_level_required": "gc",
        "rationale": (
            "Reserved for strategic deals (>$1M ARR) or counterparties with strong "
            "leverage. Requires GC sign-off to manage precedent risk."
        ),
    },
]


def seed(apps, schema_editor):
    ClauseFamily = apps.get_model("playbook", "ClauseFamily")
    SubClause = apps.get_model("playbook", "SubClause")
    PlaybookEntry = apps.get_model("playbook", "PlaybookEntry")

    family, _ = ClauseFamily.objects.get_or_create(name=SEED_FAMILY)
    sub, _ = SubClause.objects.get_or_create(name=SEED_SUB)

    for entry in SEED_ENTRIES:
        PlaybookEntry.objects.get_or_create(
            clause_family=family,
            sub_clause=sub,
            tier=entry["tier"],
            defaults={
                "position_description": entry["position_description"],
                "approval_level_required": entry["approval_level_required"],
                "rationale": entry["rationale"],
                "version": 1,
            },
        )


def unseed(apps, schema_editor):
    PlaybookEntry = apps.get_model("playbook", "PlaybookEntry")
    ClauseFamily = apps.get_model("playbook", "ClauseFamily")
    SubClause = apps.get_model("playbook", "SubClause")

    PlaybookEntry.objects.filter(
        clause_family__name=SEED_FAMILY,
        sub_clause__name=SEED_SUB,
        tier__in=[e["tier"] for e in SEED_ENTRIES],
    ).delete()
    ClauseFamily.objects.filter(name=SEED_FAMILY, playbookentry__isnull=True).delete()
    SubClause.objects.filter(name=SEED_SUB, playbookentry__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("playbook", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
