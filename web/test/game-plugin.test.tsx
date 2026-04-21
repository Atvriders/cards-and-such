import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsForm } from "../src/platform/game-plugin/settings.js";
import { defaultsOf } from "../src/platform/game-plugin/types.js";
import { hashSettings } from "../src/platform/game-plugin/hashSettings.js";
import { mulberry32 } from "../src/platform/game-plugin/useSeededRng.js";

describe("SettingsForm", () => {
  it("renders number, enum, and boolean fields", () => {
    const schema = {
      count: { kind: "number", label: "Count", min: 1, max: 10, default: 5 },
      mode: { kind: "enum", label: "Mode", options: ["easy", "hard"] as const, default: "easy" },
      loud: { kind: "boolean", label: "Loud", default: false },
    } as const;
    const values = defaultsOf(schema);
    render(<SettingsForm schema={schema} values={values} onChange={() => {}} />);
    expect(screen.getByLabelText("Count")).toHaveValue(5);
    expect(screen.getByLabelText("Mode")).toHaveValue("easy");
    expect(screen.getByLabelText("Loud")).not.toBeChecked();
  });
});

describe("hashSettings", () => {
  it("produces 8 hex chars", () => {
    expect(hashSettings({ a: 1 })).toMatch(/^[0-9a-f]{8}$/);
  });
  it("stable under key reorder", () => {
    expect(hashSettings({ a: 1, b: 2 })).toEqual(hashSettings({ b: 2, a: 1 }));
  });
});

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(42), b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
});
