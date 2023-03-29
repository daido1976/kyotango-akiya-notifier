export async function fetchAkiyaCount(): Promise<number | null> {
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
      "マッチする文字列がありません。正規表現が間違っている可能性があります。"
    );
    return null;
  }

  const akiyaCount = match[1];
  return parseInt(akiyaCount);
}

// for debug
if (import.meta.main) {
  const akiyaCount = await fetchAkiyaCount();
  console.log({ akiyaCount });
}
