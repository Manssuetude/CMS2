# Component Conventions

> Les composants sont presentation-first. Ils affichent les données CMS, collectent les interactions utilisateur et délèguent les décisions métier aux services ou repositories.

---

## Règles

- Les composants ne doivent **pas** appeler Supabase directement
- Les composants ne doivent **pas** connaître les noms de tables
- Les composants ne doivent **pas** contenir de règles métier (recommandations, relations, permissions, publication, traitement média)
- Les composants client (`"use client"`) ne doivent être utilisés que lorsque l'état, les événements ou les API navigateur sont requis
- Les variantes de composants importantes doivent être enregistrées dans un registre central avant d'être utilisées largement

---

## Documentation requise pour les composants importants

Tout composant partagé ou complexe doit documenter :

| Élément | Description |
|---|---|
| **Purpose** | Pourquoi ce composant existe |
| **Props** | Liste typée des props attendues |
| **Variants** | Variantes disponibles |
| **Usage** | Exemple d'utilisation |
| **Restrictions** | Ce que ce composant ne doit pas faire |
| **Example** | Exemple de code minimal |
