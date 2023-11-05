export type Akiya = {
  slug: number;
  url: string;
  imgUrl: string;
};

export type AkiyaKind = "chintai" | "baibai";

export function isAkiyaKind(value: unknown): value is AkiyaKind {
  return value === "chintai" || value === "baibai";
}
