import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.181.0/testing/bdd.ts";
import { compareCount, difference } from "./utils.ts";

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

describe("difference", () => {
  it("returns the correct difference of two arrays", () => {
    assertEquals(difference([1, 2, 3, 4], [2, 4, 6]), [1, 3]);
    assertEquals(difference([2, 4, 6], [1, 2, 3, 4]), [6]);
    assertEquals(difference(["a", "b", "c"], ["b"]), ["a", "c"]);
    assertEquals(difference(["foo", "bar"], []), ["foo", "bar"]);
  });

  it("returns an empty array if the input arrays are empty", () => {
    assertEquals(difference([], []), []);
  });
});
