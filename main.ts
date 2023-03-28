async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の件数取得
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
    return;
  }

  const akiyaCount = match[1];
  console.log({ akiyaCount });

  // 2. 件数をgistに保存 & 前回の件数と比較して増えてるか判定
  // 3. 増えてたらLINEボット or LINE Notify APIで通知
}

if (import.meta.main) {
  await main();
}
