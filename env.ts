import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts";

const env = await load();

export const lineChannelAccessToken = env["LINE_CHANNEL_ACCESS_TOKEN"];
