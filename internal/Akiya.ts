import { expect } from "./lib/maybe.ts";

export type Akiya = {
  slug: number;
  url: string;
  imgUrl: string;
};

export const tryToSlug = (url: string) => {
  const regex = /https:\/\/kyotango-akiya\.jp\/akiya\/(\d+)/;
  const slugStr = expect(
    url.match(regex)?.[1],
    `URL does not match the expected format. Expected pattern "https://kyotango-akiya.jp/akiya/[slug]". Received URL: "${url}"`
  );
  return Number(slugStr);
};

export const toSlugs = (akiyas: Akiya[]) => akiyas.map((a) => a.slug);

export type AkiyaKind = "chintai" | "baibai";

export function isAkiyaKind(value: unknown): value is AkiyaKind {
  return value === "chintai" || value === "baibai";
}

export function kindToKanji(kind: AkiyaKind) {
  return kind === "chintai" ? "賃貸" : "売買";
}
