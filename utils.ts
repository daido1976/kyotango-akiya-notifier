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
