import { describe, expect, it } from "vitest";
import {
  UsernameSchema,
  GameIdSchema,
  WsClientMessageSchema,
} from "../src/index.js";

describe("UsernameSchema", () => {
  it("accepts valid usernames", () => {
    expect(UsernameSchema.parse("alice_01")).toBe("alice_01");
  });
  it("rejects too short", () => {
    expect(() => UsernameSchema.parse("a")).toThrow();
  });
  it("rejects forbidden characters", () => {
    expect(() => UsernameSchema.parse("alice!")).toThrow();
  });
  it("trims whitespace", () => {
    expect(UsernameSchema.parse("  bob  ")).toBe("bob");
  });
});

describe("GameIdSchema", () => {
  it("accepts lowercase slug", () => {
    expect(GameIdSchema.parse("klondike")).toBe("klondike");
  });
  it("rejects uppercase", () => {
    expect(() => GameIdSchema.parse("Klondike")).toThrow();
  });
});

describe("WsClientMessageSchema", () => {
  it("parses auth messages", () => {
    const m = WsClientMessageSchema.parse({ type: "auth", token: "x.y.z" });
    expect(m.type).toBe("auth");
  });
  it("rejects unknown types", () => {
    expect(() => WsClientMessageSchema.parse({ type: "bogus" })).toThrow();
  });
});
