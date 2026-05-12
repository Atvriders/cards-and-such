import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { OnlineNowPanel } from "./OnlineNowPanel.js";

// The panel renders state from useLobbyPresence (WS-backed) keyed by a token
// from useAuth. We mock both hooks so we can drive deterministic presence
// snapshots into the component's render path. This exercises the JSX branches
// that depend on `online`, `users[]`, and `connected`.

const presence = vi.hoisted(() => ({
  current: {
    online: 0,
    users: [] as { username: string; game: string | null }[],
    connected: true,
  },
}));

vi.mock("../../platform/api/ws.js", () => ({
  useLobbyPresence: () => presence.current,
}));

vi.mock("../../platform/stores/auth.js", () => ({
  useAuth: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: "tok-test" }),
}));

afterEach(() => {
  cleanup();
  presence.current = { online: 0, users: [], connected: true };
});

describe("OnlineNowPanel", () => {
  it("renders the online count and each user's name + game label", () => {
    presence.current = {
      online: 2,
      users: [
        { username: "alice", game: "uno" },
        { username: "bob", game: null },
      ],
      connected: true,
    };

    render(<OnlineNowPanel />);

    // aside with aria-label="online users" wraps everything.
    const panel = screen.getByRole("complementary", { name: /online users/i });
    expect(panel).toBeInTheDocument();

    // Header: "<strong>2</strong> online" — no connecting suffix when connected.
    expect(panel.querySelector("header")?.textContent).toMatch(/^2 online\s*$/);

    // Each user appears in an <li>; assert names and game labels.
    const items = panel.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]!.querySelector(".name")?.textContent).toBe("alice");
    expect(items[0]!.querySelector(".where")?.textContent).toBe("uno");
    expect(items[1]!.querySelector(".name")?.textContent).toBe("bob");
    // game === null falls back to the literal string "in lobby".
    expect(items[1]!.querySelector(".where")?.textContent).toBe("in lobby");
  });

  it("renders 0 online with an empty user list when nobody is connected", () => {
    presence.current = { online: 0, users: [], connected: true };

    render(<OnlineNowPanel />);

    const panel = screen.getByRole("complementary", { name: /online users/i });
    expect(panel.querySelector("header strong")?.textContent).toBe("0");
    expect(panel.querySelectorAll("li")).toHaveLength(0);
  });

  it("shows the (connecting…) suffix while the socket is not yet connected", () => {
    presence.current = { online: 0, users: [], connected: false };

    render(<OnlineNowPanel />);

    const header = screen
      .getByRole("complementary", { name: /online users/i })
      .querySelector("header") as HTMLElement;
    expect(header).not.toBeNull();
    expect(header.textContent).toMatch(/0 online \(connecting…\)/);
  });

  it("uses username as the React key — distinct users render distinct list items", () => {
    presence.current = {
      online: 3,
      users: [
        { username: "a", game: "klondike" },
        { username: "b", game: "spider" },
        { username: "c", game: null },
      ],
      connected: true,
    };

    render(<OnlineNowPanel />);

    const items = screen
      .getByRole("complementary", { name: /online users/i })
      .querySelectorAll("li");
    expect(items).toHaveLength(3);
    const names = Array.from(items).map((li) => li.querySelector(".name")?.textContent);
    expect(names).toEqual(["a", "b", "c"]);
    const games = Array.from(items).map((li) => li.querySelector(".where")?.textContent);
    expect(games).toEqual(["klondike", "spider", "in lobby"]);
  });
});
