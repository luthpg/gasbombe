import { describe, expect, it } from "vitest";
import { serverScripts } from "@/lib/server";

describe("server", () => {
  it("should be defined", () => {
    expect(serverScripts).toBeDefined();
  });
});
