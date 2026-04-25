import { describe, expect, it } from "vitest";
import { sayHello } from "~/server/modules/hello";

describe("hello", () => {
  it("should say hello", () => {
    const name = "world";
    expect(sayHello(name)).toBe(`Hello, ${name}!`);
  });
});
