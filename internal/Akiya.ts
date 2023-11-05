export type Akiya = {
  slug: number;
  url: string;
  imgUrl: string;
};

export const slugsFrom = (akiyas: Akiya[]) => akiyas.map((a) => a.slug);

export type AkiyaKind = "chintai" | "baibai";

export function isAkiyaKind(value: unknown): value is AkiyaKind {
  return value === "chintai" || value === "baibai";
}

export function kindToKanji(kind: AkiyaKind) {
  return kind === "chintai" ? "賃貸" : "売買";
}
