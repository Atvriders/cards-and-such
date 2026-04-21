import { describe, expect, it } from "vitest";
import { createJwt } from "../src/auth/jwt.js";

const SECRET = "test-secret-at-least-16-chars";

describe("createJwt", () => {
  it("issues a token that verifies with the right sub", async () => {
    const jwt = createJwt(SECRET);
    const { token, expiresAt } = await jwt.issue("alice");
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(expiresAt).toBeGreaterThan(Date.now());
    const claims = await jwt.verify(token);
    expect(claims.sub).toBe("alice");
  });

  it("rejects a token signed with a different secret", async () => {
    const a = createJwt(SECRET);
    const b = createJwt("some-other-secret-123456789");
    const { token } = await a.issue("alice");
    await expect(b.verify(token)).rejects.toBeDefined();
  });
});
