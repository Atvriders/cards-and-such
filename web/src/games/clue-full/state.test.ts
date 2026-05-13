import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  reachableRooms,
  passagePartner,
  SUSPECTS,
  WEAPONS,
  ROOMS,
  type ClueFullState,
  type Card,
} from "./state.js";

const S = { passages: true };

function fresh(seed = 42): ClueFullState {
  return initialState(seed, S);
}

describe("clue-full / initial state", () => {
  it("is deterministic by seed", () => {
    const a = fresh(7);
    const b = fresh(7);
    expect(a.envelope).toEqual(b.envelope);
    expect(a.hands).toEqual(b.hands);
    expect(a.positions).toEqual(b.positions);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(fresh())).toBeNull();
  });

  it("envelope holds one suspect, one weapon, one room", () => {
    const s = fresh(123);
    expect(SUSPECTS.includes(s.envelope.suspect)).toBe(true);
    expect(WEAPONS.includes(s.envelope.weapon)).toBe(true);
    expect(ROOMS.includes(s.envelope.room)).toBe(true);
  });

  it("18 non-envelope cards are dealt evenly across 3 hands", () => {
    const s = fresh(3);
    const totalCards = s.hands.flat().length;
    expect(totalCards).toBe(18);
    for (const h of s.hands) expect(h.length).toBe(6);
    // No envelope card present anywhere.
    const all = s.hands.flat();
    expect(all.some((c) => c.kind === "suspect" && c.value === s.envelope.suspect)).toBe(false);
    expect(all.some((c) => c.kind === "weapon" && c.value === s.envelope.weapon)).toBe(false);
    expect(all.some((c) => c.kind === "room" && c.value === s.envelope.room)).toBe(false);
  });

  it("human notebook is pre-marked X for cards in hand", () => {
    const s = fresh(8);
    for (const c of s.hands[0]) {
      if (c.kind === "suspect") expect(s.notebook.suspects[c.value as (typeof SUSPECTS)[number]]).toBe("X");
      else if (c.kind === "weapon") expect(s.notebook.weapons[c.value as (typeof WEAPONS)[number]]).toBe("X");
      else expect(s.notebook.rooms[c.value as (typeof ROOMS)[number]]).toBe("X");
    }
  });
});

describe("clue-full / board topology", () => {
  it("Kitchen has a secret passage to the Study and vice versa", () => {
    expect(passagePartner("Kitchen")).toBe("Study");
    expect(passagePartner("Study")).toBe("Kitchen");
    expect(passagePartner("Conservatory")).toBe("Lounge");
    expect(passagePartner("Lounge")).toBe("Conservatory");
  });

  it("non-corner rooms have no secret passage", () => {
    expect(passagePartner("Hall")).toBeNull();
    expect(passagePartner("Billiard Room")).toBeNull();
  });

  it("a roll of 1 from Hall reaches only direct neighbors", () => {
    const r = reachableRooms("Hall", 1);
    // Hall neighbors: Dining Room, Lounge, Study, Library
    expect(new Set(r)).toEqual(new Set(["Dining Room", "Lounge", "Study", "Library"]));
  });

  it("a roll of 6 from Hall reaches every other room", () => {
    const r = reachableRooms("Hall", 6);
    expect(r.length).toBe(ROOMS.length - 1);
  });

  it("secret-passage rooms are reachable for free even on small rolls", () => {
    // From Kitchen, roll 1 reaches direct neighbors AND Study (via passage).
    const r = reachableRooms("Kitchen", 1);
    expect(r).toContain("Study");
    // And the Study's direct neighbors (Hall, Library) are reachable at
    // total cost 0 + 1 = 1, so they should appear too.
    expect(r).toContain("Hall");
    expect(r).toContain("Library");
  });
});

describe("clue-full / reducer transitions", () => {
  it("roll transitions phase from roll to move with valid destinations", () => {
    const s0 = fresh(11);
    const s1 = reducer(s0, { type: "roll" });
    expect(s1.phase).toBe("move");
    expect(s1.lastRoll).toBeGreaterThanOrEqual(1);
    expect(s1.lastRoll).toBeLessThanOrEqual(6);
    expect(s1.movableTo.length).toBeGreaterThan(0);
  });

  it("rejects move to an unreachable room", () => {
    const s0 = fresh(11);
    const s1 = reducer(s0, { type: "roll" });
    // Find a room not in movableTo.
    const bad = ROOMS.find((r) => !s1.movableTo.includes(r) && r !== s1.positions[0]);
    if (bad) {
      const s2 = reducer(s1, { type: "move", to: bad });
      expect(s2).toBe(s1);
    }
  });

  it("move places you in the room and switches to suggest", () => {
    const s0 = fresh(11);
    const s1 = reducer(s0, { type: "roll" });
    const dest = s1.movableTo[0]!;
    const s2 = reducer(s1, { type: "move", to: dest });
    expect(s2.phase).toBe("suggest");
    expect(s2.positions[0]).toBe(dest);
  });

  it("suggest pins the room to current pawn location", () => {
    const s0 = fresh(11);
    const s1 = reducer(s0, { type: "roll" });
    const dest = s1.movableTo[0]!;
    const s2 = reducer(s1, { type: "move", to: dest });
    const s3 = reducer(s2, { type: "suggest", suspect: SUSPECTS[0], weapon: WEAPONS[0] });
    // Either someone refutes (auto-handled) or accuse phase; in any case
    // a log entry was appended with the right room.
    expect(s3.log.length).toBeGreaterThan(0);
    expect(s3.log.at(-1)!.suggestion.room).toBe(dest);
  });

  it("ignores illegal accuse during win/loss state", () => {
    let s = fresh(11);
    // Force a loss.
    const wrong = {
      suspect: SUSPECTS.find((x) => x !== s.envelope.suspect)!,
      weapon: s.envelope.weapon,
      room: s.envelope.room,
    };
    s = reducer(s, { type: "accuse", ...wrong });
    expect(s.phase).toBe("lost");
    const t = reducer(s, { type: "roll" });
    expect(t).toBe(s); // No further actions accepted.
  });

  it("correct accusation wins with positive score", () => {
    const s0 = fresh(11);
    const s1 = reducer(s0, {
      type: "accuse",
      suspect: s0.envelope.suspect,
      weapon: s0.envelope.weapon,
      room: s0.envelope.room,
    });
    expect(s1.phase).toBe("won");
    const t = isTerminal(s1);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("wrong accusation loses with score 0", () => {
    const s0 = fresh(11);
    const wrongSuspect = SUSPECTS.find((s) => s !== s0.envelope.suspect)!;
    const s1 = reducer(s0, {
      type: "accuse",
      suspect: wrongSuspect,
      weapon: s0.envelope.weapon,
      room: s0.envelope.room,
    });
    expect(s1.phase).toBe("lost");
    expect(isTerminal(s1)).toEqual({ score: 0 });
  });

  it("noteToggle cycles U → X → ? → U", () => {
    let s = fresh(11);
    const target = SUSPECTS.find((sp) =>
      !s.hands[0].some((c) => c.kind === "suspect" && c.value === sp),
    )!;
    // Start: should be 'U' (since not in hand and no reveals yet).
    expect(s.notebook.suspects[target]).toBe("U");
    s = reducer(s, { type: "noteToggle", kind: "suspect", value: target });
    expect(s.notebook.suspects[target]).toBe("X");
    s = reducer(s, { type: "noteToggle", kind: "suspect", value: target });
    expect(s.notebook.suspects[target]).toBe("?");
    s = reducer(s, { type: "noteToggle", kind: "suspect", value: target });
    expect(s.notebook.suspects[target]).toBe("U");
  });

  it("secret passage from a corner skips roll and lands in the partner room", () => {
    // Construct a state where the human is in Kitchen.
    const base = fresh(11);
    const positions = base.positions.slice() as [import("./state.js").Room, import("./state.js").Room, import("./state.js").Room];
    positions[0] = "Kitchen";
    const s0: ClueFullState = { ...base, positions };
    const s1 = reducer(s0, { type: "passage" });
    expect(s1.positions[0]).toBe("Study");
    expect(s1.phase).toBe("suggest");
  });

  it("a suggestion may auto-resolve when a CPU holds a matching card", () => {
    const s0 = fresh(11);
    // Pick a suspect from CPU1's hand to force a reveal.
    const cpu1Suspect = s0.hands[1].find((c: Card) => c.kind === "suspect");
    if (!cpu1Suspect) return; // unlikely; just bail.
    // Get into a suggest-ready state.
    const s1 = reducer(s0, { type: "roll" });
    const dest = s1.movableTo[0]!;
    const s2 = reducer(s1, { type: "move", to: dest });
    const s3 = reducer(s2, {
      type: "suggest",
      suspect: cpu1Suspect.value as (typeof SUSPECTS)[number],
      weapon: WEAPONS[0],
    });
    // Either CPU1 or CPU2 has that card -> someone refuted.
    expect(s3.log.length).toBeGreaterThan(0);
    expect(s3.log.at(-1)!.byPlayer).not.toBeNull();
  });
});
