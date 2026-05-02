import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useState } from "react";
import {
  ConfirmDialog,
  useStandaloneConfirm,
  type ConfirmOptions,
} from "./ConfirmDialog.js";

describe("ConfirmDialog", () => {
  it("renders title, message, and the two buttons with stable test ids", () => {
    render(
      <ConfirmDialog
        open
        title="Are you sure?"
        message="This will delete the thing."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-yes")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-no")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This will delete the thing.")).toBeInTheDocument();
  });

  it("returns null when open is false", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="x"
        message="y"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeNull();
  });

  it("calls onCancel when Escape is pressed", () => {
    let cancelled = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        onConfirm={() => {}}
        onCancel={() => {
          cancelled = true;
        }}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(cancelled).toBe(true);
  });

  it("calls onCancel when the backdrop is clicked", () => {
    let cancelled = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        onConfirm={() => {}}
        onCancel={() => {
          cancelled = true;
        }}
      />,
    );
    const backdrop = screen.getByTestId("confirm-dialog-backdrop");
    fireEvent.click(backdrop);
    expect(cancelled).toBe(true);
  });

  it("does not call onCancel when the dialog body is clicked", () => {
    let cancelled = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        onConfirm={() => {}}
        onCancel={() => {
          cancelled = true;
        }}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-dialog"));
    expect(cancelled).toBe(false);
  });

  it("Enter confirms when focus is not on cancel", () => {
    let confirmed = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {}}
      />,
    );
    // Move focus to the confirm button — Enter then confirms.
    (screen.getByTestId("confirm-yes") as HTMLButtonElement).focus();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(confirmed).toBe(true);
  });

  it("Enter does not double-confirm when cancel button has focus", () => {
    let confirmed = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {}}
      />,
    );
    (screen.getByTestId("confirm-no") as HTMLButtonElement).focus();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(confirmed).toBe(false);
  });

  it("danger=true paints the confirm button red", () => {
    render(
      <ConfirmDialog
        open
        danger
        title="x"
        message="y"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const yes = screen.getByTestId("confirm-yes");
    expect(yes.className).toContain("confirm-dialog-btn--danger");
  });

  it("requireText disables confirm until the user types it", () => {
    render(
      <ConfirmDialog
        open
        title="Clear all"
        message="really?"
        requireText="DELETE"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const yes = screen.getByTestId("confirm-yes") as HTMLButtonElement;
    expect(yes.disabled).toBe(true);
    const input = screen.getByTestId("confirm-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "delete" } });
    expect(yes.disabled).toBe(true); // case-sensitive
    fireEvent.change(input, { target: { value: "DELETE" } });
    expect(yes.disabled).toBe(false);
  });

  it("Enter does not confirm while requireText is unmet", () => {
    let confirmed = false;
    render(
      <ConfirmDialog
        open
        title="x"
        message="y"
        requireText="DELETE"
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {}}
      />,
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(confirmed).toBe(false);
  });
});

describe("useStandaloneConfirm", () => {
  function Harness({
    opts,
    onResult,
  }: {
    opts: ConfirmOptions;
    onResult: (ok: boolean) => void;
  }): JSX.Element {
    const { showConfirm, dialog } = useStandaloneConfirm();
    const [, setTick] = useState(0);
    return (
      <div>
        {dialog}
        <button
          data-testid="trigger"
          onClick={async () => {
            const ok = await showConfirm(opts);
            onResult(ok);
            setTick((t) => t + 1);
          }}
        >
          go
        </button>
      </div>
    );
  }

  it("resolves true when confirm is clicked", async () => {
    let result: boolean | null = null;
    render(
      <Harness
        opts={{ title: "t", message: "m", confirmLabel: "Yes" }}
        onResult={(ok) => (result = ok)}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-yes"));
    });
    expect(result).toBe(true);
  });

  it("resolves false when cancel is clicked", async () => {
    let result: boolean | null = null;
    render(
      <Harness
        opts={{ title: "t", message: "m" }}
        onResult={(ok) => (result = ok)}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirm-no"));
    });
    expect(result).toBe(false);
  });
});
