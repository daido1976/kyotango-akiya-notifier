import { lineChannelAccessToken } from "./env.ts";

interface ErrorResponse {
  message: string;
  details?: {
    message: string;
    property: string;
  }[];
}

async function notifyToBot(count: number): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api.line.me/v2/bot/message/broadcast",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lineChannelAccessToken}`,
        },
        body: JSON.stringify({
          messages: [
            {
              type: "text",
              text: `現在の空き家の件数は ${count} です。\nhttps://kyotango-akiya.jp/akiya/?sr=1&kind=%E8%B3%83%E8%B2%B8`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      if (errorResponse.details) {
        console.error(
          `${response.status} ${response.statusText}: ${errorResponse.message}`
        );
        errorResponse.details.forEach((detail) =>
          console.error(`- ${detail.property}: ${detail.message}`)
        );
      } else {
        console.error(
          `${response.status} ${response.statusText}: ${errorResponse.message}`
        );
      }
      return false;
    } else {
      console.log("Message sent successfully!");
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// for debug
if (import.meta.main) {
  const result = await notifyToBot(10);
  console.log({ result });
}
