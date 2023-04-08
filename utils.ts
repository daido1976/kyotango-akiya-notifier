export function compareCount(
  previous: number,
  current: number
): "increased" | "decreased" | "unchanged" {
  if (current > previous) {
    return "increased";
  } else if (current < previous) {
    return "decreased";
  } else {
    return "unchanged";
  }
}

export function difference<T extends string | number>(a: T[], b: T[]): T[] {
  return a.filter((x) => !new Set(b).has(x));
}
