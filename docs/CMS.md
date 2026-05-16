# CMS Model

## Entity-First Model

Primary entities:

- Theme
- Production
- Activity
- Project
- Resource
- Media
- Season
- Member
- Page
- CTA
- Collection

Each entity can carry status, visibility, tags, relations, media, SEO and versioning metadata.

## Workflow

Editorial statuses:

- `draft`
- `review`
- `validated`
- `published`
- `archived`

Progress statuses:

- `idea`
- `preparation`
- `active`
- `completed`
- `paused`

## Relations

Relations are stored in `entity_relations` for the long-term graph model. Legacy relation tables can remain during migration, but new domain logic should prefer generic graph relations.

## Forms

Forms must never render automatically in public pages. CTA targets beginning with `FORM:` open the appropriate form modal.
