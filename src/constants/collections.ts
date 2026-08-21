export const collectionNames = ["pages", "themes", "productions", "events", "projects", "resources"] as const;

export type CollectionName = (typeof collectionNames)[number];

export const collectionNameSet = new Set<string>(collectionNames);

export function isCollectionName(value: string): value is CollectionName {
  return collectionNameSet.has(value);
}
