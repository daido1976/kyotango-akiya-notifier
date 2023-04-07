import {
  DENO_ENV,
  LINE_CHANNEL_ACCESS_TOKEN,
  TEST_LINE_USER_ID,
} from "./env.ts";

// See. https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message-error-response
type LineApiErrorResponse = {
  message: string;
  details?: {
    message: string;
    property: string;
  }[];
};

type LineRequestBody = {
  to?: string;
  messages: {
    type: string;
    text: string;
  }[];
};

async function notifyToBot(count: number): Promise<boolean> {
  try {
    const message = `新しい賃貸の空き家が追加されました✨\n現在の空き家の件数は ${count} 件です🏠\nhttps://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8`;
    const res = await sendLineMessage(message);

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

async function sendLineMessage(message: string): Promise<Response> {
  const messagingApiPrefix = "https://api.line.me/v2/bot/message";
  const isTest = DENO_ENV === "development";
  const options = isTest
    ? {
        message: "【テスト】\n" + message,
        url: `${messagingApiPrefix}/push`,
        to: TEST_LINE_USER_ID,
      }
    : { message, url: `${messagingApiPrefix}/broadcast` };

  const body: LineRequestBody = {
    messages: [
      {
        type: "text",
        text: options.message,
      },
    ],
  };

  if (options.to) {
    body.to = options.to;
  }

  return await fetch(options.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
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

export const Notifier = {
  notifyToBot,
};

// for debug
if (import.meta.main) {
  const result = await Notifier.notifyToBot(10);
  console.log({ result });
}
