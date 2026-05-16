# Component Conventions

## Purpose

Components are presentation-first. They display CMS data, collect user interaction, and delegate business decisions to services or repositories.

## Rules

- Components must not call Supabase directly.
- Components must not know table names.
- Components must not contain business rules for recommendations, relations, permissions, publishing, or media processing.
- Client components must be used only when state, events, or browser APIs are required.
- Important component variants must be registered in a central registry before being used broadly.

## Required Documentation For Important Components

- Purpose
- Props
- Variants
- Usage
- Restrictions
- Example
