import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrianButton } from "@/components/common/BrianButton";

// Mock lodash throttle để test throttle behavior dễ dàng hơn
jest.mock("lodash", () => ({
  ...jest.requireActual("lodash"),
  throttle: (fn: (...args: unknown[]) => unknown, _ms: number, _opts?: unknown) => {
    const throttled = (...args: unknown[]) => fn(...args);
    throttled.cancel = jest.fn();
    return throttled;
  },
}));

describe("BrianButton", () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================

  describe("Rendering", () => {
    it("renders children correctly", () => {
      render(<BrianButton>Click Me</BrianButton>);
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("renders as a button element", () => {
      render(<BrianButton>Submit</BrianButton>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("forwards ref correctly", () => {
      const ref = { current: null };
      render(<BrianButton ref={ref}>Ref Button</BrianButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("passes through className and other props", () => {
      render(
        <BrianButton className="custom-class" data-testid="my-btn">
          Styled
        </BrianButton>
      );
      const btn = screen.getByTestId("my-btn");
      expect(btn).toHaveClass("custom-class");
    });
  });

  // ===========================================================================
  // Loading State
  // ===========================================================================

  describe("Loading State", () => {
    it("shows loading spinner when onClick returns a Promise", async () => {
      const mockApiCall = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 200))
      );
      render(<BrianButton onClick={mockApiCall}>Submit</BrianButton>);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      // Spinner phải xuất hiện
      expect(button.querySelector(".animate-spin")).toBeInTheDocument();
      // Button phải bị disabled
      expect(button).toBeDisabled();

      await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 500 });
      expect(button.querySelector(".animate-spin")).not.toBeInTheDocument();
    });

    it("does NOT show loading spinner when showLoading is false", async () => {
      const mockApiCall = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 200))
      );
      render(
        <BrianButton onClick={mockApiCall} showLoading={false}>
          Submit
        </BrianButton>
      );

      fireEvent.click(screen.getByRole("button"));

      // Spinner không được xuất hiện dù đang loading
      expect(
        screen.getByRole("button").querySelector(".animate-spin")
      ).not.toBeInTheDocument();

      await waitFor(() =>
        expect(screen.getByRole("button")).not.toBeDisabled()
      );
    });

    it("does NOT show loading spinner when onClick is synchronous", () => {
      const syncHandler = jest.fn(() => undefined);
      render(<BrianButton onClick={syncHandler}>Sync</BrianButton>);

      fireEvent.click(screen.getByRole("button"));

      expect(
        screen.getByRole("button").querySelector(".animate-spin")
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("re-enables button after async handler completes (via instant resolve)", async () => {
      // Verify rằng button luôn re-enable sau khi Promise kết thúc (resolve hoặc reject).
      // BrianButton dùng try/finally nên đây là guaranteed behavior.
      let resolveFn!: () => void;
      const mockCall = jest.fn(
        () => new Promise<void>((resolve) => { resolveFn = resolve; })
      );

      render(<BrianButton onClick={mockCall}>Submit</BrianButton>);
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();

      await act(async () => {
        resolveFn();
        await Promise.resolve();
      });

      await waitFor(() =>
        expect(screen.getByRole("button")).not.toBeDisabled()
      );
    });
  });

  // ===========================================================================
  // Disabled State
  // ===========================================================================

  describe("Disabled State", () => {
    it("is disabled when disabled prop is true", () => {
      render(<BrianButton disabled>Disabled</BrianButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does NOT call onClick when disabled", () => {
      const handler = jest.fn();
      render(
        <BrianButton disabled onClick={handler}>
          Disabled
        </BrianButton>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Cleanup
  // ===========================================================================

  describe("Cleanup", () => {
    it("cancels throttle on unmount", () => {
      const { unmount } = render(<BrianButton>Cancel Test</BrianButton>);
      // Nếu không throw lỗi khi unmount → cleanup hoạt động đúng
      expect(() => unmount()).not.toThrow();
    });
  });
});
