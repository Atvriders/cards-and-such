import { describe, expect, it } from "vitest";
import { LANG, t } from "./i18n.js";

describe("i18n", () => {
  it("exposes a hard-coded active language of 'en'", () => {
    expect(LANG).toBe("en");
  });

  it("returns the translated string for known registry keys", () => {
    expect(t("nav.lobby")).toBe("Lobby");
    expect(t("hud.score")).toBe("Score");
    expect(t("settings.title")).toBe("Settings");
  });

  it("falls back to the key itself for unknown lookups", () => {
    expect(t("does.not.exist")).toBe("does.not.exist");
    expect(t("")).toBe("");
  });
});
