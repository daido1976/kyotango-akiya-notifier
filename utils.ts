export function difference<T extends string | number>(a: T[], b: T[]): T[] {
  return a.filter((x) => !new Set(b).has(x));
}

export function getArrayChanges<T extends string | number>(
  oldArray: T[],
  newArray: T[]
): {
  added: T[];
  removed: T[];
  changed: boolean;
} {
  const added = difference(newArray, oldArray);
  const removed = difference(oldArray, newArray);
  const changed = added.length > 0 || removed.length > 0;

  return { added, removed, changed };
}
