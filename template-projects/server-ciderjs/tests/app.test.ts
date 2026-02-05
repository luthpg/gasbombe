import { describe, expect, test } from "vitest";
import { myFunction } from "@/app";
import { useHello } from "@/modules/hello";

describe("main", () => {
  test("useHello", () => {
    expect(useHello("world")).toBe("Hello world");
  });

  test("myFunction", () => {
    myFunction();
    expect(Logger.log).toHaveBeenCalledWith("Hello world");
  });
});
