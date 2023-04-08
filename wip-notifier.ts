import {
  DENO_ENV,
  LINE_CHANNEL_ACCESS_TOKEN,
  TEST_LINE_USER_ID,
} from "./env.ts";
import { Akiya } from "./types.ts";

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
  messages: (
    | {
        type: "text";
        text: string;
      }
    | {
        type: "template";
        altText: string;
        template: {
          type: "image_carousel";
          columns: {
            imageUrl: string;
            action: {
              type: string;
              label: string;
              uri: string;
            };
          }[];
        };
      }
  )[];
};

async function notifyToBot(
  currentCount: number,
  newAkiyas: Akiya[]
): Promise<boolean> {
  const message = `新しい賃貸の空き家が ${newAkiyas.length} 件追加されました✨\n現在の空き家の件数は ${currentCount} 件です🏠\nhttps://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8`;
  try {
    const res = await sendLineMessage(message, newAkiyas);
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

async function sendLineMessage(
  message: string,
  akiyas: Akiya[]
): Promise<Response> {
  const messagingApiPrefix = "https://api.line.me/v2/bot/message";
  const isTest = DENO_ENV === "development";
  const options = isTest
    ? {
        message: "【テスト】\n" + message,
        url: `${messagingApiPrefix}/push`,
        to: TEST_LINE_USER_ID,
      }
    : { message, url: `${messagingApiPrefix}/broadcast` };

  const columns = akiyas.map((akiya) => ({
    imageUrl: akiya.imgUrl,
    action: {
      type: "uri",
      label: "詳細を見る",
      uri: akiya.url,
    },
  }));

  const body: LineRequestBody = {
    messages: [
      {
        type: "text",
        text: options.message,
      },
      {
        type: "template",
        altText: "新着の空き家があります！",
        template: {
          type: "image_carousel",
          columns: columns,
        },
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

export const WipNotifier = {
  notifyToBot,
};

// for debug
if (import.meta.main) {
  const result = await WipNotifier.notifyToBot(20, [
    {
      slug: 8100,
      url: "https://kyotango-akiya.jp/akiya/8100/",
      imgUrl:
        "https://kyotango-akiya.jp/wp/wp-content/uploads/2023/04/IMG20230404132409-1024x768.jpg",
    },
    {
      slug: 8033,
      url: "https://kyotango-akiya.jp/akiya/8033/",
      imgUrl:
        "https://kyotango-akiya.jp/wp/wp-content/uploads/2023/04/R1-092-1.jpg",
    },
    {
      slug: 7922,
      url: "https://kyotango-akiya.jp/akiya/7922/",
      imgUrl:
        "https://kyotango-akiya.jp/wp/wp-content/uploads/2023/03/IMG_4744.jpg",
    },
  ]);
  console.log({ result });
}
