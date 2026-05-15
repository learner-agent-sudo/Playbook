"""
Admin registrations.

Django auto-generates a full CRUD interface for each registered model. The
ModelAdmin classes below just tune the list views and form layout — they're
not required for CRUD to work, only to make the screens easier to scan.
"""

from django.contrib import admin

from .models import (
    ClauseFamily,
    CounterpartyDraft,
    NegotiationLogEntry,
    PlaybookEntry,
    SubClause,
)


@admin.register(ClauseFamily)
class ClauseFamilyAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(SubClause)
class SubClauseAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(PlaybookEntry)
class PlaybookEntryAdmin(admin.ModelAdmin):
    list_display = (
        "clause_family",
        "sub_clause",
        "tier",
        "approval_level_required",
        "version",
        "updated_at",
    )
    list_filter = ("clause_family", "tier", "approval_level_required")
    search_fields = ("position_description", "rationale")
    autocomplete_fields = ("clause_family", "sub_clause")


@admin.register(CounterpartyDraft)
class CounterpartyDraftAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "clause_family",
        "sub_clause",
        "industry",
        "counterparty_size",
        "deal_value_band",
        "created_at",
    )
    list_filter = (
        "clause_family",
        "industry",
        "counterparty_size",
        "deal_value_band",
        "urgency",
    )
    search_fields = ("clause_text",)
    autocomplete_fields = ("clause_family", "sub_clause")


@admin.register(NegotiationLogEntry)
class NegotiationLogEntryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "counterparty_draft",
        "playbook_entry",
        "approval_level_used",
        "date_closed",
    )
    list_filter = ("approval_level_used", "date_closed")
    search_fields = ("final_position", "what_was_traded")
    autocomplete_fields = ("counterparty_draft", "playbook_entry")
    fieldsets = (
        (None, {
            "fields": (
                "counterparty_draft",
                "playbook_entry",
                "final_position",
                "approval_level_used",
                "what_was_traded",
                "date_closed",
            ),
        }),
        ("Commercial justification", {
            "fields": (
                "leverage",
                "risk_assessment",
                "trade_or_context",
                "precedent_management",
            ),
        }),
    )
