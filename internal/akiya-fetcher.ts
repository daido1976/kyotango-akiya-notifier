import { DOMParser, Element } from "./deps.ts";
import { Akiya } from "./types.ts";
import { expect } from "./lib/maybe.ts";
import { Result, failure, success } from "./lib/result.ts";

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
    const akiyaList = expect(
      document?.querySelector("body > section > div.akiyalist"),
      "Failed to find the akiyaList element."
    );
    // See. https://github.com/b-fuze/deno-dom/issues/4#issuecomment-716299531
    const alImgs = [...akiyaList.querySelectorAll(".al_img")] as Element[];
    const value = Array.from(alImgs, (alImg) => {
      const url = expect(
        alImg.querySelector("a")?.getAttribute("href"),
        "Failed to retrieve the url attribute."
      );
      const imgUrl = expect(
        alImg.querySelector("img")?.getAttribute("src"),
        "Failed to retrieve the imgUrl attribute."
      );
      const slugStr = expect(
        url.match(/https:\/\/kyotango-akiya\.jp\/akiya\/(\d+)/)?.[1],
        "Failed to match the URL with the regular expression."
      );
      const slug = parseInt(slugStr);

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
