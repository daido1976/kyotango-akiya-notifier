export { load } from "https://deno.land/std@0.198.0/dotenv/mod.ts";
// See. https://deno.land/manual@v1.36.1/advanced/jsx_dom/deno_dom
export {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

// for debug or test
export { delay } from "https://deno.land/std@0.198.0/async/delay.ts";
export { assertEquals } from "https://deno.land/std@0.198.0/testing/asserts.ts";
export { describe, it } from "https://deno.land/std@0.198.0/testing/bdd.ts";
