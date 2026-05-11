import { describe, it, expect } from "vitest";
import { defaultsOf, type SettingSchema } from "./types";

describe("defaultsOf", () => {
  it("extracts the `default` value from each SettingField kind", () => {
    const schema = {
      level: { kind: "number", label: "Level", min: 1, max: 10, default: 3 },
      mode: {
        kind: "enum",
        label: "Mode",
        options: ["easy", "hard"] as const,
        default: "easy",
      },
      sound: { kind: "boolean", label: "Sound", default: true },
    } as const satisfies SettingSchema;

    const defaults = defaultsOf(schema);

    expect(defaults).toEqual({ level: 3, mode: "easy", sound: true });
    // Each property is its own own-property (not inherited), matching schema keys exactly.
    expect(Object.keys(defaults).sort()).toEqual(["level", "mode", "sound"]);
  });

  it("returns an empty object for an empty schema", () => {
    const result = defaultsOf({});
    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("preserves the runtime type of each default value", () => {
    const schema = {
      n: { kind: "number", label: "N", min: 0, max: 5, step: 1, default: 2 },
      e: {
        kind: "enum",
        label: "E",
        options: ["a", "b", "c"] as const,
        default: "b",
      },
      b: { kind: "boolean", label: "B", default: false },
    } as const satisfies SettingSchema;

    const d = defaultsOf(schema);
    expect(typeof d.n).toBe("number");
    expect(d.n).toBe(2);
    expect(typeof d.e).toBe("string");
    expect(d.e).toBe("b");
    expect(typeof d.b).toBe("boolean");
    expect(d.b).toBe(false);
  });

  it("does not share references between successive calls", () => {
    const schema = {
      x: { kind: "number", label: "X", min: 0, max: 1, default: 0 },
    } as const satisfies SettingSchema;

    const a = defaultsOf(schema);
    const b = defaultsOf(schema);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});
