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
      "No matching string found. The regular expression may be invalid."
    );
    return null;
  }

  const akiyaCount = match[1];
  return parseInt(akiyaCount);
}

export const AkiyaFetcher = {
  fetchCountBy,
};

// for debug
if (import.meta.main) {
  const akiyaCount = await AkiyaFetcher.fetchCountBy("chintai");
  console.log({ akiyaCount });
}
