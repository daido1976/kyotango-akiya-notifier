// refs.
// https://github.com/TimMikeladze/gist-database
// https://dev.to/rikurouvila/how-to-use-a-github-gist-as-a-free-database-20np
import { DENO_ENV, GIST_ID, GIST_TOKEN } from "./env.ts";
import { Akiya, AkiyaKind } from "./Akiya.ts";

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
  chintaiAkiyas?: Akiya[];
  baibaiAkiyas?: Akiya[];
};
type SchemaKey = keyof Schema;

export function toSchemaKey(kind: AkiyaKind): SchemaKey {
  return kind === "chintai" ? "chintaiAkiyas" : "baibaiAkiyas";
}

// TODO: getRoot と get の返り値の型を Result<Maybe<Schema>> にする
async function getRoot(): Promise<Result<Schema>> {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    if (!res.ok) {
      console.error(`Failed to get Gist: ${res.statusText}`);
      return failure();
    }

    const gist: GistResponse = await res.json();
    const file = gist.files[gistFileName];
    if (!file || file.content === "") {
      console.error(
        `Gist file "${gistFileName}" not found or content is empty`
      );
      return failure();
    }

    return success(JSON.parse(file.content));
  } catch (error) {
    console.error(`Failed to get Gist: ${error}`);
    return failure();
  }
}

async function get<T extends SchemaKey>(key: T): Promise<Result<Schema[T]>> {
  return map(await getRoot(), (root) => root[key]);
}

// NOTE: Gist の更新は反映まで数秒のタイムラグがある様子
async function set<T extends SchemaKey>(
  key: T,
  value: Schema[T]
): Promise<Result<void>> {
  const root = await getRoot();
  if (!root.success) {
    console.error("Failed to update Gist: failed to get root.");
    return failure();
  }

  root.value[key] = value;
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GIST_TOKEN}`,
      },
      body: JSON.stringify({
        files: {
          [gistFileName]: {
            content: JSON.stringify(root.value, null, 2),
          },
        },
      }),
    });

    if (!res.ok) {
      console.error(`Failed to update Gist: ${res.statusText}`);
      return failure();
    }

    return success(undefined);
  } catch (error) {
    console.error(`Failed to update Gist: ${error}`);
    return failure();
  }
}

export const DB = {
  get,
  set,
};

// for debug
import { delay } from "./deps.ts";
import { Result, failure, success, map } from "./lib/result.ts";
if (import.meta.main) {
  const root = await getRoot();
  console.log({ root });
  const chintaiAkiyas = await get("chintaiAkiyas");
  console.log({ chintaiAkiyas });
  // with side effect
  // TODO: 現在 gist に保存されている配列 + ランダムな Akiya のオブジェクトにする（ランダムな Akiya オブジェクトは ChatGPT 使えば型から生成できそう）
  const ok = await set("chintaiAkiyas", [
    {
      slug: 8100,
      url: "https://kyotango-akiya.jp/akiya/8100/",
      imgUrl:
        "https://kyotango-akiya.jp/wp/wp-content/uploads/2023/04/IMG20230404132409-1024x768.jpg",
    },
  ]);
  console.log({ ok });
  await delay(10000);
  const root2 = await getRoot();
  console.log({ root2 });
  const chintaiAkiyas2 = await get("chintaiAkiyas");
  console.log({ chintaiAkiyas2 });
}
