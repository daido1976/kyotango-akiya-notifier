import { DOMParser } from "https://esm.sh/linkedom@0.14.25";

type Akiya = {
  url: string;
  imgUrl: string;
};

async function fetchAkiyasBy(
  key: "chintai" | "baibai"
): Promise<Akiya[] | null> {
  // NOTE: 必要になったら売買の方もサポートする。
  if (key === "baibai") {
    throw new Error("Not supported: baibai akiya count retrieval.");
  }

  const response = await fetch(
    // https://kyotango-akiya.jp/akiya/?sr=1&kind=賃貸
    "https://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8"
  );
  const htmlString = await response.text();
  const document = new DOMParser().parseFromString(htmlString, "text/html");
  const akiyaList = document.querySelector("body > section > div.akiyalist");
  const alImgs = akiyaList.querySelectorAll(".al_img");
  return Array.from(alImgs, (alImg) => ({
    url: alImg.querySelector("a").getAttribute("href"),
    imgUrl: alImg.querySelector("img").getAttribute("src"),
  }));
}

async function fetchCountBy(key: "chintai" | "baibai"): Promise<number | null> {
  // NOTE: 必要になったら売買の方もサポートする。
  if (key === "baibai") {
    throw new Error("Not supported: baibai akiya count retrieval.");
  }

  const response = await fetch(
    // https://kyotango-akiya.jp/akiya/?sr=1&kind=賃貸
    "https://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8"
  );
  const htmlString = await response.text();
  const regex =
    /<script>.*?document\.getElementById\('al_count'\)\.innerHTML\s*=\s*(\d+);.*?<\/script>/s;

  const match = regex.exec(htmlString);
  if (!match) {
    console.error(
      "No matching string found. The regular expression may be invalid or the HTML may have changed."
    );
    return null;
  }

  const akiyaCount = match[1];
  if (!akiyaCount) {
    console.error(
      "No akiya count found. The regular expression may be invalid or the HTML may have changed."
    );
    return null;
  }

  return parseInt(akiyaCount);
}

export const AkiyaFetcher = {
  fetchAkiyasBy,
  fetchCountBy,
};

// for debug
if (import.meta.main) {
  const akiyas = await AkiyaFetcher.fetchAkiyasBy("chintai");
  console.log({ akiyas });

  const akiyaCount = await AkiyaFetcher.fetchCountBy("chintai");
  console.log({ akiyaCount });
}
