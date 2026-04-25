import { beforeEach, describe, expect, it } from "vitest";
import { setupCounter } from "../../src/counter";

describe("counter", () => {
  let button;

  beforeEach(() => {
    // 仮想のDOM要素をセットアップ
    button = document.createElement("button");
    document.body.appendChild(button);
  });

  it("should initialize and increment counter", () => {
    setupCounter(button);
    expect(button.innerHTML).toBe("count is 0");

    button.click();
    expect(button.innerHTML).toBe("count is 1");
  });
});
