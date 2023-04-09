import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.181.0/testing/bdd.ts";
import { compareCount } from "./utils.ts";

describe("compareCount", () => {
  it("returns 'increased' when current count is greater than previous count", () => {
    assertEquals(compareCount(1, 2), "increased");
  });
  it("returns 'decreased' when current count is less than previous count", () => {
    assertEquals(compareCount(2, 1), "decreased");
  });
  it("returns 'unchanged' when current count is equal to previous count", () => {
    assertEquals(compareCount(1, 1), "unchanged");
  });
});
