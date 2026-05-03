import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./AppShell.js";
import { useAuth } from "./stores/auth.js";
import { encodeChallenge } from "./friendCode.js";
import { markWelcomeTutorialSeen } from "./tutorials.js";

// Lightweight URL spy: rendered alongside AppShell so we can assert which
// route + querystring `submitCode` actually navigates to without booting
// the full PlayPage tree.
function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return (
    <div
      data-testid="location-probe"
      data-pathname={loc.pathname}
      data-search={loc.search}
    />
  );
}

function renderShell(): void {
  // RequireAuth gate is bypassed by mounting AppShell directly under a
  // pathless layout route — this matches the App.tsx structure but skips
  // the auth wrapper, since W539 only exercises the header modal.
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div data-testid="home-stub" />} />
          <Route
            path="/play/:gameId"
            element={<div data-testid="play-stub" />}
          />
        </Route>
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("AppShell code-input modal (W539)", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    localStorage.clear();
    // Mark the welcome carousel seen so AppShell doesn't auto-render the
    // WelcomeTutorial dialog — that dialog also has role="dialog" and would
    // collide with our `getByRole("dialog")` lookup for the code modal.
    markWelcomeTutorialSeen();
    // Authenticate so AppShell renders without redirecting to /login (not
    // strictly required here since RequireAuth is bypassed, but keeps the
    // shell's username badge stable across the suite).
    useAuth.setState({
      username: "alice",
      token: "tok.tok.tok",
      expiresAt: Date.now() + 60_000,
    });
  });

  it("opens the modal when the 'Have a code?' header link is clicked", async () => {
    const user = userEvent.setup();
    renderShell();

    // Modal starts closed — the dialog and its input are absent.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("app-code-input")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("nav-have-a-code"));

    // Header + form are now in the DOM with the friend-code title visible.
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "app-code-title");
    expect(screen.getByText(/enter friend code/i)).toBeInTheDocument();
    expect(screen.getByTestId("app-code-input")).toBeInTheDocument();
    expect(screen.getByTestId("app-code-go")).toBeInTheDocument();
  });

  it("submits a valid code and navigates to /play/<id>?seed=<seed>&friend=1", async () => {
    const user = userEvent.setup();
    // Encode against the live registry so the test stays in lock-step with
    // friendCode.ts — any decoder change still round-trips this pair.
    const code = encodeChallenge({ gameId: "klondike", seed: 12345 });
    expect(code).not.toBeNull();
    renderShell();

    await user.click(screen.getByTestId("nav-have-a-code"));
    const input = await screen.findByTestId("app-code-input");
    await user.type(input, code as string);
    await user.click(screen.getByTestId("app-code-go"));

    // Modal auto-closes on a successful decode.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // The probe reports the post-navigation URL — pathname + querystring
    // both match what `submitCode` builds: /play/klondike?seed=12345&friend=1.
    const probe = screen.getByTestId("location-probe");
    expect(probe).toHaveAttribute("data-pathname", "/play/klondike");
    expect(probe).toHaveAttribute("data-search", "?seed=12345&friend=1");
    expect(screen.getByTestId("play-stub")).toBeInTheDocument();
  });

  it("shows an inline error and stays open when the code is invalid", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByTestId("nav-have-a-code"));
    const input = await screen.findByTestId("app-code-input");
    // "ZZZZZZ" is well-formed length-wise but its checksum will never
    // match — `decodeChallenge` returns null, triggering the error path.
    await user.type(input, "ZZZZZZ");
    await user.click(screen.getByTestId("app-code-go"));

    // Inline error is rendered with role=alert so AT users get it announced.
    const err = await screen.findByTestId("app-code-error");
    expect(err).toHaveAttribute("role", "alert");
    expect(err).toHaveTextContent(/didn't decode/i);

    // Modal remains mounted; navigation did NOT occur.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("location-probe")).toHaveAttribute(
      "data-pathname",
      "/",
    );
  });
});
