import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HelloWorld from "../../../src/components/HelloWorld.vue";

describe("HelloWorld.vue", () => {
  it("renders props.msg", () => {
    const msg = "Hello Vitest";
    const wrapper = mount(HelloWorld, {
      props: { msg },
    });
    expect(wrapper.find("h1").text()).toBe(msg);
  });

  it("increments the counter when button is clicked", async () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: "Test" },
    });

    // 最初のボタン（カウンター）を取得
    const button = wrapper.findAll("button")[0];
    expect(button.text()).toContain("count is 0");

    // クリックして更新を待機
    await button.trigger("click");
    expect(button.text()).toContain("count is 1");
  });
});
