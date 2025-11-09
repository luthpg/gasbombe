import { describe, expect, test, vi } from "vitest";
import { myFunction } from "@/main";
import { useHello } from "@/modules/hello";

describe("main", () => {
  test("useHello", () => {
    expect(useHello("world")).toBe("Hello world");
  });

  test("myFunction", () => {
    vi.stubGlobal("Logger", { log: vi.fn() });
    myFunction();
    expect(Logger.log).toHaveBeenCalledWith("Hello world");
  });
});
