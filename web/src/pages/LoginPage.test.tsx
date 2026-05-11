import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage.js";
import { useAuth } from "../platform/stores/auth.js";

function resetAuth(): void {
  useAuth.setState({
    username: null,
    token: null,
    expiresAt: null,
    status: "idle",
    error: null,
  });
}

function renderLogin(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div data-testid="home-page">home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    resetAuth();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetAuth();
  });

  it("renders username input and the default 'Claim' submit button", () => {
    renderLogin();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.getByLabelText("username")).toBeInTheDocument();
    // Default mode is "claim", so the submit button label is "Claim".
    expect(screen.getByRole("button", { name: "Claim" })).toBeInTheDocument();
    // Mode-switch buttons exist for both flows.
    expect(screen.getByRole("button", { name: "Claim new" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume existing" })).toBeInTheDocument();
  });

  it("submits a valid username, POSTs to /api/auth/claim, and stores the returned token", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ username: "alice", token: "tok-abc", expiresAt: 9_999_999_999 }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    renderLogin();

    const input = screen.getByLabelText("username");
    fireEvent.change(input, { target: { value: "alice" } });
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/claim");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ username: "alice" }));

    await waitFor(() => {
      expect(useAuth.getState().token).toBe("tok-abc");
    });
    expect(useAuth.getState().username).toBe("alice");
  });

  it("shows the server error in an alert when the claim request fails", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: "username_taken" }),
        { status: 409, headers: { "content-type": "application/json" } },
      ),
    );

    renderLogin();

    fireEvent.change(screen.getByLabelText("username"), { target: { value: "alice" } });
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("username_taken");
    expect(useAuth.getState().status).toBe("error");
    expect(useAuth.getState().token).toBeNull();
  });

  it("redirects to '/' once a token is present in the auth store", async () => {
    renderLogin();

    // No token yet -> still on login page.
    expect(screen.getByTestId("login-page")).toBeInTheDocument();

    // Simulate a successful auth happening (e.g. another tab) -> store gains a token.
    useAuth.setState({
      username: "alice",
      token: "tok-xyz",
      expiresAt: Date.now() + 60_000,
      status: "idle",
      error: null,
    });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("login-page")).toBeNull();
  });
});
