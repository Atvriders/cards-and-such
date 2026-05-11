import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../api/http.js", () => ({
  claimUsername: vi.fn(),
  resumeUsername: vi.fn(),
}));

import { useAuth } from "./auth";
import { claimUsername, resumeUsername } from "../api/http.js";

const claimMock = claimUsername as unknown as ReturnType<typeof vi.fn>;
const resumeMock = resumeUsername as unknown as ReturnType<typeof vi.fn>;

describe("useAuth store", () => {
  beforeEach(() => {
    claimMock.mockReset();
    resumeMock.mockReset();
    useAuth.setState({
      username: null,
      token: null,
      expiresAt: null,
      status: "idle",
      error: null,
    });
  });

  afterEach(() => {
    useAuth.setState({
      username: null,
      token: null,
      expiresAt: null,
      status: "idle",
      error: null,
    });
  });

  it("claim() stores the username/token on success and clears error", async () => {
    claimMock.mockResolvedValueOnce({
      username: "alice",
      token: "tok-123",
      expiresAt: 999,
    });

    // Seed an existing error to confirm it gets cleared
    useAuth.setState({ status: "error", error: "prior" });

    await useAuth.getState().claim("alice");

    const s = useAuth.getState();
    expect(s.username).toBe("alice");
    expect(s.token).toBe("tok-123");
    expect(s.expiresAt).toBe(999);
    expect(s.status).toBe("idle");
    expect(s.error).toBeNull();
    expect(claimMock).toHaveBeenCalledWith("alice");
  });

  it("resume() records the error message and transitions to error status on failure", async () => {
    resumeMock.mockRejectedValueOnce(new Error("username_not_found"));

    await useAuth.getState().resume("bob");

    const s = useAuth.getState();
    expect(s.status).toBe("error");
    expect(s.error).toBe("username_not_found");
    expect(s.username).toBeNull();
    expect(s.token).toBeNull();
  });

  it("logout() resets identity fields back to defaults", () => {
    useAuth.setState({
      username: "carol",
      token: "tok-xyz",
      expiresAt: 12345,
      status: "idle",
      error: null,
    });

    useAuth.getState().logout();

    const s = useAuth.getState();
    expect(s.username).toBeNull();
    expect(s.token).toBeNull();
    expect(s.expiresAt).toBeNull();
    expect(s.status).toBe("idle");
    expect(s.error).toBeNull();
  });
});
