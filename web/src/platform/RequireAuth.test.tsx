import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth.js";
import { useAuth } from "./stores/auth.js";

function resetAuth(): void {
  useAuth.setState({
    username: null,
    token: null,
    expiresAt: null,
    status: "idle",
    error: null,
  });
}

function renderWithRouter(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div data-testid="protected-content">secret</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    resetAuth();
  });

  afterEach(() => {
    resetAuth();
  });

  it("renders children when a valid, unexpired token is in the auth store", () => {
    useAuth.setState({
      username: "alice",
      token: "tok-good",
      expiresAt: Date.now() + 60_000,
      status: "idle",
      error: null,
    });

    renderWithRouter();

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).toBeNull();
  });

  it("redirects to /login when no token is present", () => {
    renderWithRouter();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("redirects to /login when the token is expired", () => {
    useAuth.setState({
      username: "alice",
      token: "tok-old",
      expiresAt: Date.now() - 1_000,
      status: "idle",
      error: null,
    });

    renderWithRouter();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });
});
