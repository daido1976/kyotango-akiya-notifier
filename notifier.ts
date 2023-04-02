import { lineChannelAccessToken } from "./env.ts";

// See. https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message-error-response
type LineApiErrorResponse = {
  message: string;
  details?: {
    message: string;
    property: string;
  }[];
};

export async function notifyToBot(count: number): Promise<boolean> {
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lineChannelAccessToken}`,
      },
      body: JSON.stringify({
        messages: [
          {
            type: "text",
            text: `新しい賃貸の空き家が追加されました✨\n現在の空き家の件数は ${count} 件です🏠\nhttps://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8`,
          },
        ],
      }),
    });

    if (res.ok) {
      console.log("Message sent successfully!");
      return true;
    } else {
      const errRes: LineApiErrorResponse = await res.json();
      handleErrorResponse(res, errRes);
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

function handleErrorResponse(res: Response, errRes: LineApiErrorResponse) {
  if (errRes.details) {
    console.error(`${res.status} ${res.statusText}: ${errRes.message}`);
    errRes.details.forEach((detail) =>
      console.error(`- ${detail.property}: ${detail.message}`)
    );
  } else {
    console.error(`${res.status} ${res.statusText}: ${errRes.message}`);
  }
}

// for debug
if (import.meta.main) {
  const result = await notifyToBot(10);
  console.log({ result });
}
