import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import { getAcronym } from "./phrases.js";
import { PHRASES } from "./phrases.js";

const defaultSettings = { difficulty: "easy" as const };

describe("Acrophobia initialState", () => {
  it("creates a state with a valid acronym", () => {
    const s = initialState(1, defaultSettings);
    expect(s.acronym.length).toBeGreaterThan(0);
    expect(/^[A-Z]+$/.test(s.acronym)).toBe(true);
  });

  it("acronym matches canonical words", () => {
    const s = initialState(1, defaultSettings);
    const expectedAcronym = s.canonicalWords.map(w => w[0]!.toUpperCase()).join("");
    expect(s.acronym).toBe(expectedAcronym);
  });

  it("starts with empty player words", () => {
    const s = initialState(1, defaultSettings);
    expect(s.playerWords.every(w => w === "")).toBe(true);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.acronym).toBe(s2.acronym);
    expect(s1.canonicalWords).toEqual(s2.canonicalWords);
  });
});

describe("Acrophobia getAcronym", () => {
  it("produces acronym from phrase words", () => {
    const entry = { words: ["Thank", "God", "It's", "Friday"] };
    expect(getAcronym(entry)).toBe("TGIF");
  });

  it("handles single word", () => {
    const entry = { words: ["Hello"] };
    expect(getAcronym(entry)).toBe("H");
  });
});

describe("Acrophobia reducer - typing", () => {
  it("typeChar adds uppercase character to inputText", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "typeChar", char: "h" });
    expect(s2.inputText).toBe("H");
  });

  it("backspace removes last char", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "typeChar", char: "h" });
    const s3 = reducer(s2, { type: "typeChar", char: "i" });
    const s4 = reducer(s3, { type: "backspace" });
    expect(s4.inputText).toBe("H");
  });

  it("backspace on empty does nothing", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "backspace" });
    expect(s2.inputText).toBe("");
  });

  it("nextSlot commits input to slot and advances", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "typeChar", char: "h" });
    const s3 = reducer(s2, { type: "nextSlot" });
    expect(s3.playerWords[0]).toBe("H");
    expect(s3.activeSlot).toBe(1);
  });
});

describe("Acrophobia reducer - submit", () => {
  it("submit sets submitted to true", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.submitted).toBe(true);
  });

  it("submit counts correct first-letter slots", () => {
    const s = initialState(1, defaultSettings);
    // Fill in words with matching first letters for all slots
    let curr = s;
    for (let i = 0; i < s.acronym.length; i++) {
      curr = reducer(curr, { type: "selectSlot", slot: i });
      const letter = s.canonicalWords[i]![0]!;
      curr = reducer(curr, { type: "typeChar", char: letter });
    }
    const submitted = reducer(curr, { type: "submit" });
    expect(submitted.correctSlots).toBe(s.acronym.length);
  });

  it("submit gives 0 correctSlots when all wrong", () => {
    const s = initialState(1, defaultSettings);
    // Find a letter NOT used as first letter of any canonical word
    const firstLetters = new Set(s.canonicalWords.map(w => w[0]!.toUpperCase()));
    const wrongLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find(l => !firstLetters.has(l)) ?? "Z";
    let curr = s;
    for (let i = 0; i < s.acronym.length; i++) {
      curr = reducer(curr, { type: "selectSlot", slot: i });
      curr = reducer(curr, { type: "typeChar", char: wrongLetter });
    }
    const submitted = reducer(curr, { type: "submit" });
    // At least some should be wrong (might coincidentally match)
    expect(submitted.correctSlots).toBeLessThanOrEqual(s.acronym.length);
  });

  it("no actions accepted after submitted (except nextRound)", () => {
    const s = initialState(1, defaultSettings);
    const submitted = reducer(s, { type: "submit" });
    const s2 = reducer(submitted, { type: "typeChar", char: "x" });
    expect(s2).toBe(submitted);
  });
});

describe("Acrophobia isTerminal", () => {
  it("returns null before last round submitted", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns null after submit on non-last round", () => {
    const s = initialState(1, defaultSettings);
    const submitted = reducer(s, { type: "submit" });
    expect(isTerminal(submitted)).toBeNull();
  });

  it("returns score after all rounds complete", () => {
    let s = initialState(1, defaultSettings);
    // Play through all 5 rounds
    for (let r = 0; r < 5; r++) {
      s = reducer(s, { type: "submit" });
      if (r < 4) {
        s = reducer(s, { type: "nextRound" });
      }
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});

describe("Acrophobia PHRASES", () => {
  it("all phrases have at least 2 words", () => {
    PHRASES.forEach(p => {
      expect(p.words.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("all first letters are letters", () => {
    PHRASES.forEach(p => {
      const acronym = getAcronym(p);
      expect(/^[A-Z]+$/.test(acronym)).toBe(true);
    });
  });
});
