import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts";

const env = await load();

export const lineChannelAccessToken =
  env["LINE_CHANNEL_ACCESS_TOKEN"] ?? Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
export const gistId = env["GIST_ID"] ?? Deno.env.get("GIST_ID");
export const gistToken = env["GIST_TOKEN"] ?? Deno.env.get("GIST_TOKEN");
