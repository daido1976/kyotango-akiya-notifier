// See. https://deno.land/manual@v1.32.3/advanced/jsx_dom/linkedom
import { DOMParser } from "https://esm.sh/linkedom@0.14.25";
import { Akiya } from "./types.ts";
import { Result, failure, success } from "./result.ts";

async function fetchAkiyasBy(
  key: "chintai" | "baibai"
): Promise<Result<Akiya[]>> {
  // NOTE: 必要になったら売買の方もサポートする。
  if (key === "baibai") {
    throw new Error("Not supported: baibai akiya count retrieval.");
  }

  try {
    const response = await fetch(
      // https://kyotango-akiya.jp/akiya/?sr=1&kind=賃貸
      "https://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8"
    );
    const htmlString = await response.text();
    const document = new DOMParser().parseFromString(htmlString, "text/html");
    const akiyaList = document.querySelector("body > section > div.akiyalist");
    const alImgs = akiyaList.querySelectorAll(".al_img");
    // TODO: any 撲滅運動をする
    const value = Array.from(alImgs, (alImg) => {
      const url = alImg.querySelector("a").getAttribute("href");
      const imgUrl = alImg.querySelector("img").getAttribute("src");
      const slug = parseInt(
        url.match(/https:\/\/kyotango-akiya\.jp\/akiya\/(\d+)/)[1]
      );
      return {
        slug,
        url,
        imgUrl,
      };
    });
    return success(value);
  } catch (e) {
    console.error(e);
    return failure();
  }
}

export const AkiyaFetcher = {
  fetchAkiyasBy,
};

// for debug
if (import.meta.main) {
  const akiyas = await AkiyaFetcher.fetchAkiyasBy("chintai");
  console.log({ akiyas });
}
