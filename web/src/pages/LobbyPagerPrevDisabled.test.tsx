import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2402 — pin the `disabled` attribute on the `lobby-pager-prev` control
 * when the lobby first lands on page 1.
 *
 * The pager renders Prev / Next buttons with `disabled={safePage <= 1}`
 * and `disabled={safePage >= totalPages}` respectively. On the default
 * first-load render the page state is `1` so the Prev button MUST be
 * `disabled` — clicking it would clamp via `Math.max(1, p - 1)` anyway,
 * but the disabled flag is the load-bearing user-visible signal that
 * there is no previous page. A regression that drops the `disabled`
 * binding (e.g. a refactor that swaps the comparator or forgets to
 * thread `safePage` into the prop) would let users click Prev on page
 * one with no visible affordance change, masking the boundary state
 * that screen readers and keyboard users rely on.
 *
 * The neighbour pins (W1342 prev type=button, W1387 next type=button,
 * W1304 status aria-live, W1441 wrapper class) cover the static shape
 * of the pager, so this file pins ONLY the `disabled` boundary state
 * on Prev — and asserts the sibling Next is NOT disabled at page one
 * to guard against a comparator-swap that flips both bindings together.
 *
 * The default list-mode is "pagination" (see W183/W582) and the default
 * registry has more than PAGE_SIZE entries, so the pager mounts on
 * first load with no localStorage seeding required.
 */
describe("LobbyPage — pager prev disabled at page 1 (W2402)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager-prev is disabled on first load (safePage <= 1)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: pagination-mode pager is the mounted footer in the default
    // render — the toggle's persistence twin is empty so
    // `readPersistedListMode()` falls back to "pagination".
    expect(screen.getByTestId("lobby-pager")).toBeInTheDocument();

    const prev = screen.getByTestId("lobby-pager-prev") as HTMLButtonElement;
    // Pin the rendered DOM property AND the reflected attribute — jsdom
    // surfaces both for a `disabled` boolean prop on a <button>, and a
    // regression that drops the binding would clear them in lockstep.
    expect(prev).toBeDisabled();
    expect(prev.disabled).toBe(true);

    // Belt-and-suspenders — on page one the Next button MUST NOT be
    // disabled (totalPages>1 in the default registry), so a comparator
    // flip that disables both buttons together would still fail this
    // assertion. Without this neighbour check the test would silently
    // pass against a regression that disabled the entire pager.
    const next = screen.getByTestId("lobby-pager-next") as HTMLButtonElement;
    expect(next).not.toBeDisabled();
    expect(next.disabled).toBe(false);
  });
});
