// refs.
// https://github.com/TimMikeladze/gist-database
// https://dev.to/rikurouvila/how-to-use-a-github-gist-as-a-free-database-20np
import { DENO_ENV, GIST_ID, GIST_TOKEN } from "./env.ts";

// NOTE: 最初に {} をセットする必要あり。
const gistFileName =
  DENO_ENV === "development"
    ? "kyotango-akiya-notifier-test.json"
    : "kyotango-akiya-notifier.json";

// See. https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#get-a-gist
type GistResponse = {
  files: {
    [fileName: string]: {
      content: string;
      size: number;
    };
  };
  id: string;
  url: string;
};

type Schema = {
  chintaiAkiyaCount?: number;
  // NOTE: 綺麗にするなら `{ akiyaCount?: { chintai?: number, baibai?: number }, ... }` としてもいいかもだが、現在はスキーマが単純なのでフラットにしておく
  // Not currently in use
  baibaiAkiyaCount?: number;
};
type SchemaKey = keyof Schema;

async function getRoot(): Promise<Schema | undefined> {
  try {
    const req = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    if (!req.ok) {
      console.error(`Failed to get Gist: ${req.statusText}`);
      return undefined;
    }

    const gist: GistResponse = await req.json();
    const file = gist.files[gistFileName];
    if (!file || file.content === "") {
      console.error(
        `Gist file "${gistFileName}" not found or content is empty`
      );
      return undefined;
    }

    return JSON.parse(file.content);
  } catch (error) {
    console.error(`Failed to get Gist: ${error}`);
    return undefined;
  }
}

async function get<T extends SchemaKey>(
  key: T
): Promise<Schema[T] | undefined> {
  const root = await getRoot();
  return root ? root[key] : undefined;
}

// NOTE: Gist の更新は反映まで数秒のタイムラグがある様子
async function set<T extends SchemaKey>(
  key: T,
  value: Schema[T]
): Promise<boolean> {
  const root = await getRoot();
  if (!root) {
    console.error("Failed to update Gist: failed to get root.");
    return false;
  }

  // deno-lint-ignore no-explicit-any
  root[key] = value as any;
  try {
    const req = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GIST_TOKEN}`,
      },
      body: JSON.stringify({
        files: {
          [gistFileName]: {
            content: JSON.stringify(root, null, 2),
          },
        },
      }),
    });

    if (!req.ok) {
      console.error(`Failed to update Gist: ${req.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Failed to update Gist: ${error}`);
    return false;
  }
}

export const DB = {
  get,
  set,
};

// for debug
import { delay } from "https://deno.land/std@0.182.0/async/delay.ts";
if (import.meta.main) {
  const root = await getRoot();
  console.log({ root });
  const chintaiAkiyaCount = await get("chintaiAkiyaCount");
  console.log({ chintaiAkiyaCount });
  // with side effect
  const ok = await set(
    "chintaiAkiyaCount",
    chintaiAkiyaCount !== undefined ? chintaiAkiyaCount + 1 : 0
  );
  console.log({ ok });
  await delay(10000);
  const root2 = await getRoot();
  console.log({ root2 });
  const chintaiAkiyaCount2 = await get("chintaiAkiyaCount");
  console.log({ chintaiAkiyaCount2 });
}
