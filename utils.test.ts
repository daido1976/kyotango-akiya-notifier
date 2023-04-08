import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.181.0/testing/bdd.ts";
import { compareCount, difference, getArrayChanges } from "./utils.ts";

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
  it("returns an empty array if the input arrays are empty", () => {
    assertEquals(difference([], []), []);
  });

  it("returns the correct difference of two arrays", () => {
    assertEquals(difference([1, 2, 3, 4], [2, 4, 6]), [1, 3]);
    assertEquals(difference([2, 4, 6], [1, 2, 3, 4]), [6]);
    assertEquals(difference(["a", "b", "c"], ["b"]), ["a", "c"]);
    assertEquals(difference(["foo", "bar"], []), ["foo", "bar"]);
  });
});

describe("getArrayChanges", () => {
  it("returns empty arrays when both oldArray and newArray are empty", () => {
    assertEquals(getArrayChanges([], []), { added: [], removed: [] });
  });

  it("returns empty added and all elements of oldArray when newArray is empty", () => {
    assertEquals(getArrayChanges([1, 2, 3], []), {
      added: [],
      removed: [1, 2, 3],
    });
  });

  it("returns empty removed and all elements of newArray when oldArray is empty", () => {
    assertEquals(getArrayChanges([], [1, 2, 3]), {
      added: [1, 2, 3],
      removed: [],
    });
  });

  it("returns empty arrays when oldArray and newArray have the same elements", () => {
    assertEquals(getArrayChanges([1, 2, 3], [1, 2, 3]), {
      added: [],
      removed: [],
    });
  });

  it("returns added and removed elements when oldArray and newArray have different elements", () => {
    assertEquals(getArrayChanges([1, 2, 3], [2, 3, 4]), {
      added: [4],
      removed: [1],
    });
  });
});
