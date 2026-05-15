"""
Data model for the contract playbook prototype.

Five tables:
  - ClauseFamily and SubClause are reference tables you manage in the admin
    (e.g. "Limitation of Liability", "general cap"). They are independent —
    any sub-clause can pair with any family.
  - PlaybookEntry: one position on one clause family + sub-clause at one tier.
  - CounterpartyDraft: one incoming clause to review, with deal context.
  - NegotiationLogEntry: one closed negotiation, linked to the draft and the
    playbook entry that applied.

Shared choice constants (tiers, approval levels, scenario metadata) live at
the top of this file. To add a new option, add a tuple to the relevant list.
"""

from django.db import models


TIER_CHOICES = [
    ("ideal", "Ideal"),
    ("acceptable", "Acceptable"),
    ("fallback_1", "Fallback 1"),
    ("fallback_2", "Fallback 2"),
    ("walk_away", "Walk-away"),
]

APPROVAL_LEVEL_CHOICES = [
    ("self", "Self"),
    ("senior_counsel", "Senior counsel"),
    ("gc", "GC"),
    ("cfo", "CFO"),
    ("ceo", "CEO"),
]

INDUSTRY_CHOICES = [
    ("saas", "SaaS"),
    ("finserv", "Financial services"),
    ("health", "Healthcare"),
    ("retail", "Retail / e-commerce"),
    ("public", "Public sector"),
    ("other", "Other"),
]

COUNTERPARTY_SIZE_CHOICES = [
    ("smb", "SMB"),
    ("mid", "Mid-market"),
    ("ent", "Enterprise"),
]

DEAL_VALUE_BAND_CHOICES = [
    ("lt_50k", "< $50k"),
    ("50k_250k", "$50k – $250k"),
    ("250k_1m", "$250k – $1M"),
    ("gt_1m", "> $1M"),
]

TERM_LENGTH_CHOICES = [
    ("lt_1y", "< 1 year"),
    ("1y", "1 year"),
    ("2_3y", "2–3 years"),
    ("gt_3y", "3+ years"),
]

URGENCY_CHOICES = [
    ("low", "Low"),
    ("medium", "Medium"),
    ("high", "High"),
]

COUNTERPARTY_TYPE_CHOICES = [
    ("customer", "Customer"),
    ("vendor", "Vendor"),
    ("partner", "Partner"),
]


class ClauseFamily(models.Model):
    name = models.CharField(max_length=120, unique=True)

    class Meta:
        verbose_name_plural = "Clause families"
        ordering = ["name"]

    def __str__(self):
        return self.name


class SubClause(models.Model):
    name = models.CharField(max_length=120, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PlaybookEntry(models.Model):
    clause_family = models.ForeignKey(ClauseFamily, on_delete=models.PROTECT)
    sub_clause = models.ForeignKey(SubClause, on_delete=models.PROTECT)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    position_description = models.TextField()
    approval_level_required = models.CharField(max_length=20, choices=APPROVAL_LEVEL_CHOICES)
    rationale = models.TextField(blank=True)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Playbook entries"
        ordering = ["clause_family__name", "sub_clause__name", "tier"]

    def __str__(self):
        return f"{self.clause_family} · {self.sub_clause} · {self.get_tier_display()} (v{self.version})"


class CounterpartyDraft(models.Model):
    industry = models.CharField(max_length=20, choices=INDUSTRY_CHOICES)
    counterparty_size = models.CharField(max_length=10, choices=COUNTERPARTY_SIZE_CHOICES)
    deal_value_band = models.CharField(max_length=20, choices=DEAL_VALUE_BAND_CHOICES)
    term_length = models.CharField(max_length=10, choices=TERM_LENGTH_CHOICES)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES)
    counterparty_type = models.CharField(max_length=20, choices=COUNTERPARTY_TYPE_CHOICES)
    clause_family = models.ForeignKey(ClauseFamily, on_delete=models.PROTECT)
    sub_clause = models.ForeignKey(SubClause, on_delete=models.PROTECT)
    clause_text = models.TextField()
    source = models.CharField(max_length=60, default="synthetic")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Draft #{self.pk}: {self.clause_family} · {self.sub_clause}"


class NegotiationLogEntry(models.Model):
    counterparty_draft = models.ForeignKey(CounterpartyDraft, on_delete=models.PROTECT)
    playbook_entry = models.ForeignKey(
        PlaybookEntry,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Leave blank if the negotiation was out of playbook (novel position).",
    )
    final_position = models.TextField()

    leverage = models.TextField(
        verbose_name="Counterparty leverage",
        help_text="Why the counterparty had (or didn't have) the power to push this position.",
    )
    risk_assessment = models.TextField(
        help_text="How material the residual risk is in this deal.",
    )
    trade_or_context = models.TextField(
        verbose_name="Trade or context",
        help_text="What was exchanged or the commercial context driving the decision.",
    )
    precedent_management = models.TextField(
        help_text="How this affects precedent across future deals.",
    )

    approval_level_used = models.CharField(max_length=20, choices=APPROVAL_LEVEL_CHOICES)
    what_was_traded = models.TextField(blank=True)
    date_closed = models.DateField()

    class Meta:
        verbose_name_plural = "Negotiation log entries"
        ordering = ["-date_closed"]

    def __str__(self):
        return f"Log #{self.pk}: {self.counterparty_draft} ({self.date_closed})"
