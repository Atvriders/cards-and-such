import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen, fireEvent, within } from "@testing-library/react";
import { ToastHost, useToast } from "./Toast.js";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset toasts between tests; the store's `push`/`dismiss` actions are
    // restored by Zustand for us, we only clear the list.
    act(() => {
      useToast.setState({ toasts: [] });
    });
  });

  afterEach(() => {
    // Drop pending setTimeout dismiss callbacks queued by `push` so they
    // don't fire setState after unmount in the next test.
    vi.clearAllTimers();
    vi.useRealTimers();
    act(() => {
      useToast.setState({ toasts: [] });
    });
  });

  it("renders pushed toasts with role status for info/success and role alert for error", () => {
    render(<ToastHost />);
    act(() => {
      useToast.getState().push("info", "Saved");
      useToast.getState().push("error", "Boom");
    });

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveClass("toast-host");

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Saved");
    expect(status).toHaveClass("toast-info");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Boom");
    expect(alert).toHaveClass("toast-error");
  });

  it("auto-dismisses a toast after 4000ms", () => {
    render(<ToastHost />);
    act(() => {
      useToast.getState().push("success", "Done");
    });

    expect(screen.getByRole("status")).toHaveTextContent("Done");
    expect(useToast.getState().toasts).toHaveLength(1);

    // 3999ms: still present.
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(useToast.getState().toasts).toHaveLength(1);
    expect(screen.queryByText("Done")).not.toBeNull();

    // Cross the 4000ms threshold: removed.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(useToast.getState().toasts).toHaveLength(0);
    expect(screen.queryByText("Done")).toBeNull();
  });

  it("removes a toast immediately when its dismiss button is clicked", () => {
    render(<ToastHost />);
    act(() => {
      useToast.getState().push("info", "Click me away");
    });

    const toast = screen.getByRole("status");
    const btn = within(toast).getByRole("button", { name: "dismiss" });
    expect(btn).toHaveTextContent("✕");

    act(() => {
      fireEvent.click(btn);
    });

    expect(useToast.getState().toasts).toHaveLength(0);
    expect(screen.queryByText("Click me away")).toBeNull();
  });

  it("dismiss(id) only removes the matching toast and leaves others intact", () => {
    render(<ToastHost />);
    act(() => {
      useToast.getState().push("info", "first");
      useToast.getState().push("info", "second");
      useToast.getState().push("info", "third");
    });

    const ids = useToast.getState().toasts.map((t) => t.id);
    expect(ids).toHaveLength(3);

    act(() => {
      useToast.getState().dismiss(ids[1]);
    });

    const remaining = useToast.getState().toasts.map((t) => t.message);
    expect(remaining).toEqual(["first", "third"]);
    expect(screen.queryByText("second")).toBeNull();
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("third")).toBeInTheDocument();
  });
});
