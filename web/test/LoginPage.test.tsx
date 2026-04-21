import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../src/pages/LoginPage.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("LoginPage", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("calls claim with the typed username", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 10000 }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/username/i), "alice");
    await user.click(screen.getByRole("button", { name: /^claim$/i }));
    expect(useAuth.getState().username).toBe("alice");
  });

  it("shows an error when the username is taken", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ error: "username_taken" }),
      { status: 409, headers: { "content-type": "application/json" } },
    ));
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/username/i), "taken");
    await user.click(screen.getByRole("button", { name: /^claim$/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("username_taken");
  });
});
