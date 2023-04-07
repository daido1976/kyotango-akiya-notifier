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

// NOTE: O(N^2) なので注意（パフォーマンスに懸念がある場合は Set を使ったコードに修正する）
export function difference<T extends string | number>(a: T[], b: T[]): T[] {
  return a.filter((x) => !b.includes(x));
}
