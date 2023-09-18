import { DOMParser, Element } from "./deps.ts";
import { Akiya, AkiyaKind } from "./types.ts";
import { expect } from "./lib/maybe.ts";
import { Result, failure, success } from "./lib/result.ts";

async function fetchAkiyasBy(kind: AkiyaKind): Promise<Result<Akiya[]>> {
  const kindParams = kind === "chintai" ? "賃貸" : "売買";
  // e.g. https://kyotango-akiya.jp/akiya/?sr=1&kind=賃貸
  const url = `https://kyotango-akiya.jp/akiya/?sr=1&kind=${kindParams}`;
  console.log(`Fetching akiyas from "${url}"`);

  try {
    const response = await fetch(url);
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
