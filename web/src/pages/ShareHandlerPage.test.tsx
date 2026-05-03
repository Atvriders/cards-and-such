import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ShareHandlerPage from "./ShareHandlerPage.js";
import { encodeChallenge } from "../platform/friendCode.js";

// Capture navigate() calls so we can assert the redirect target without
// actually mounting the destination route.
const navigateSpy = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/share" element={<ShareHandlerPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ShareHandlerPage", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
  });

  it("renders without crashing on an empty share payload", () => {
    renderAt("/share");
    expect(screen.getByTestId("share-handler-page")).toBeInTheDocument();
  });

  it("redirects to /play/<id>?seed=<seed>&friend=1 for a valid friend code in ?text=", () => {
    const seed = 12345;
    const gameId = "klondike";
    const code = encodeChallenge({ gameId, seed });
    expect(code).not.toBeNull();

    renderAt(`/share?text=${encodeURIComponent(code as string)}`);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      `/play/${gameId}?seed=${seed}&friend=1`,
      { replace: true },
    );
  });

  it("renders the shared-fallback header and back link for unrecognised text", () => {
    renderAt(`/share?text=${encodeURIComponent("just some random note")}`);

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /Cards & Such — Shared/ }),
    ).toBeInTheDocument();
    const back = screen.getByTestId("share-handler-go");
    expect(back).toHaveAttribute("href", "/");
    expect(back).toHaveTextContent(/Back to lobby/);
  });
});
