import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "@/App";

describe("App Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("render the component and handle counter click", () => {
    render(<App />);

    // カウンターの初期状態を確認
    const countButton = screen.getByText(/count is 0/i);
    expect(countButton).toBeInTheDocument();

    // クリックイベントを発火してカウントアップを確認
    fireEvent.click(countButton);
    expect(screen.getByText(/count is 1/i)).toBeInTheDocument();
  });

  it("have a hello button", () => {
    render(<App />);
    const helloButton = screen.getByText("Click to say hello");
    expect(helloButton).toBeInTheDocument();
  });
});
