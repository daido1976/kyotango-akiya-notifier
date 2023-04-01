// refs.
// https://github.com/TimMikeladze/gist-database
// https://dev.to/rikurouvila/how-to-use-a-github-gist-as-a-free-database-20np
import { gistId, gistToken } from "./env.ts";

// NOTE: 最初に {} をセットする必要あり。
const gistFileName = "kyotango-akiya-notifier.json";

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

// TODO: 全体的に API リクエストが失敗した時のハンドリングをサボっているのでやる
// TODO: 該当の Gist やファイルがない場合、content が空（""）の場合も考慮する
async function getRoot(): Promise<Schema> {
  const req = await fetch(`https://api.github.com/gists/${gistId}`);
  const gist: GistResponse = await req.json();
  return JSON.parse(gist.files[gistFileName].content);
}

async function get<T extends SchemaKey>(
  key: T
): Promise<Schema[T] | undefined> {
  const root = await getRoot();
  return root[key];
}

// NOTE: Gist の更新は反映まで数秒のタイムラグがある様子
async function set<T extends SchemaKey>(key: SchemaKey, value: Schema[T]) {
  const root = await getRoot();
  root[key] = value;
  const req = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${gistToken}`,
    },
    body: JSON.stringify({
      files: {
        [gistFileName]: {
          content: JSON.stringify(root, null, 2),
        },
      },
    }),
  });

  return req.json();
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
  await set(
    "chintaiAkiyaCount",
    chintaiAkiyaCount !== undefined ? chintaiAkiyaCount + 1 : 0
  );
  await delay(10000);
  const root2 = await getRoot();
  console.log({ root2 });
  const chintaiAkiyaCount2 = await get("chintaiAkiyaCount");
  console.log({ chintaiAkiyaCount2 });
}
