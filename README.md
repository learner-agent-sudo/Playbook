# Contract Playbook (prototype)

A personal portfolio project: a dynamic playbook for SaaS contract
negotiation, built in plain Django so a lawyer can read and modify it.

This repo currently covers **Chunk 1**: the data model and a minimal admin UI
to create, view, edit and delete records. The review workflow (Chunk 2) and
pattern surfacing (Chunk 3) come later.

## Run it locally

You need Python 3.11+ on your machine. From the project root:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Then open <http://127.0.0.1:8000/>. The root URL redirects to `/admin/`.
Log in with the superuser you just created.

The first migration creates the schema. The second seeds three example
*Limitation of Liability · General cap* playbook entries (ideal, acceptable,
fallback 1) so the admin isn't empty.

## The data model

Five tables, all in `playbook/models.py`:

| Table | What it represents |
|---|---|
| `ClauseFamily` | Reference list — e.g. *Limitation of Liability*, *IP Indemnity*. |
| `SubClause` | Reference list — e.g. *General cap*, *Confidentiality cap*. Independent of family. |
| `PlaybookEntry` | One position on one clause family + sub-clause at one tier. |
| `CounterpartyDraft` | One incoming clause to review, with deal context. |
| `NegotiationLogEntry` | One closed negotiation, linked to a draft and (usually) a playbook entry. |

Shared dropdown values — tiers, approval levels, industries, deal-value
bands, etc. — live as choice lists at the top of `playbook/models.py`. To
add a new option, add a tuple to the relevant list and run
`python manage.py makemigrations playbook && python manage.py migrate`.

## How CRUD works

Django generates the create / list / edit / delete screens automatically from
the models. `playbook/admin.py` just tunes column lists, filters and form
sections — you don't need to touch it to add or edit records.

Each model has a dedicated screen in the admin sidebar:

- *Clause families* and *Sub clauses* — manage the vocabularies.
- *Playbook entries* — your positions, one per tier.
- *Counterparty drafts* — incoming clauses you want to review.
- *Negotiation log entries* — closed negotiations. The four sub-fields of the
  commercial justification appear as a separate section on the form.
