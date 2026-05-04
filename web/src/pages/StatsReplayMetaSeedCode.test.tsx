import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1409: StatsPage renders each saved replay's row with a meta span
 * (`<span className="stats-replay-meta">`) whose seed value is wrapped in
 * a `<code>` element — i.e. JSX `seed <code>{r.seed}</code>`. The `<code>`
 * tag is load-bearing: it gives the seed monospace styling so users can
 * read/copy the numeric seed unambiguously from non-numeric meta text.
 * Existing replay-row tests pin the row className, the panel subtitle,
 * and the play-link className, but none assert that the seed value is
 * actually rendered inside a `<code>` element (a regression that swapped
 * the tag for a plain `<span>` would silently lose monospace seed
 * formatting while the row otherwise still rendered). We seed one replay
 * with a recognisable seed and pin both the tag name and the inner text.
 */
describe("StatsPage replays panel — replay row seed <code> tag", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1409: stats-replay-0 meta renders the seed inside a <code> element", () => {
    localStorage.setItem(
      "cards-replays",
      JSON.stringify([
        { id: "r-seed", gameId: "klondike", seed: 4242, actions: ["a"], savedAt: 1 },
      ]),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("stats-replays-panel");
    const row = within(panel).getByTestId("stats-replay-0");

    // The meta span carries the `stats-replay-meta` class hook…
    const meta = row.querySelector(".stats-replay-meta");
    expect(meta).not.toBeNull();

    // …and the seed value is rendered inside a real <code> element.
    const codeEl = meta!.querySelector("code");
    expect(codeEl).not.toBeNull();
    expect(codeEl!.tagName).toBe("CODE");
    expect(codeEl!.textContent).toBe("4242");
  });
});
