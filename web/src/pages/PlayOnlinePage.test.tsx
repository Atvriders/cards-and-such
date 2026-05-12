import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PlayOnlinePage from "./PlayOnlinePage.js";
import { useAuth } from "../platform/stores/auth.js";

/**
 * Exercises PlayOnlinePage's real rendering + room-create flow:
 *  - Auth gate is seeded via useAuth.setState so rooms.ts's authed()
 *    helper does not short-circuit with "not_authenticated".
 *  - fetch is stubbed via vi.stubGlobal so createRoom() resolves with a
 *    schema-valid envelope.
 *  - MemoryRouter wraps the page; a sibling /:gameId/online/:roomId route
 *    captures the navigate() after a successful create.
 */

const VALID_ROOM = {
  id: "abcdef012345",          // 12 lowercase alphanumerics (RoomIdSchema)
  code: "AB12",                // 4 uppercase alphanumerics (RoomCodeSchema)
  gameId: "connect-4",         // a real multiplayer-enabled game
  members: [],
  min: 2,
  max: 2,
  phase: "waiting" as const,
};

function seedAuth(): void {
  useAuth.setState({
    username: "alice",
    token: "tok-123",
    expiresAt: Date.now() + 60_000,
    status: "idle",
    error: null,
  });
}

function resetAuth(): void {
  useAuth.setState({
    username: null,
    token: null,
    expiresAt: null,
    status: "idle",
    error: null,
  });
}

function renderAt(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/play/:gameId/online" element={<PlayOnlinePage />} />
        <Route path="/play/:gameId/online/:roomId" element={<PlayOnlinePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PlayOnlinePage", () => {
  beforeEach(() => {
    seedAuth();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetAuth();
  });

  it("renders the create-room and join-by-code controls for a multiplayer game", () => {
    renderAt("/play/connect-4/online");

    expect(screen.getByTestId("play-online-page")).toBeInTheDocument();
    // The page heading combines the game title with " — Online".
    expect(screen.getByRole("heading", { level: 1, name: /Connect 4.*Online/i })).toBeInTheDocument();
    // Create button is enabled at rest (busy=false initially).
    const createBtn = screen.getByTestId("create-room") as HTMLButtonElement;
    expect(createBtn).toBeInTheDocument();
    expect(createBtn.disabled).toBe(false);
    // Join button is disabled until 4 chars typed in the code input.
    const codeInput = screen.getByTestId("room-code-input") as HTMLInputElement;
    expect(codeInput).toBeInTheDocument();
    expect(codeInput.maxLength).toBe(4);
    const joinBtn = screen.getByTestId("join-room") as HTMLButtonElement;
    expect(joinBtn.disabled).toBe(true);
  });

  it("calls POST /api/rooms with a bearer token and navigates to the new room on create", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ room: VALID_ROOM, seat: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderAt("/play/connect-4/online");

    fireEvent.click(screen.getByTestId("create-room"));

    // Wait for the fetch dispatch and confirm wire shape.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/rooms");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok-123");
    expect(JSON.parse(init.body as string)).toEqual({ gameId: "connect-4" });

    // After success, navigate() takes us to /play/connect-4/online/:roomId,
    // where PlayOnlinePage re-renders as the room view.
    await waitFor(() => {
      expect(screen.getByTestId("play-online-room")).toBeInTheDocument();
    });
    // Heading shows the first 4 chars of the room id, upper-cased.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "In room ABCD",
    );
  });

  it("surfaces the server error in role=alert when createRoom fails", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ error: "room_create_failed" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderAt("/play/connect-4/online");

    fireEvent.click(screen.getByTestId("create-room"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("room_create_failed");
    // Still on the lobby view (no navigate happened).
    expect(screen.getByTestId("play-online-page")).toBeInTheDocument();
    // Create button re-enabled in the finally block.
    expect((screen.getByTestId("create-room") as HTMLButtonElement).disabled).toBe(false);
  });
});
