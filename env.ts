import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts";

const env = await load();

export const LINE_CHANNEL_ACCESS_TOKEN =
  env["LINE_CHANNEL_ACCESS_TOKEN"] ?? Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
export const GIST_ID = env["GIST_ID"] ?? Deno.env.get("GIST_ID");
export const GIST_TOKEN = env["GIST_TOKEN"] ?? Deno.env.get("GIST_TOKEN");
export const TEST_LINE_USER_ID =
  env["TEST_LINE_USER_ID"] ?? Deno.env.get("TEST_LINE_USER_ID");
