import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type Darts501State, type Darts501Action } from "./state.js";
const Darts501 = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Darts501 as unknown as React.ComponentType<unknown> })));
export const darts501Settings = {
  startScore: { kind: "enum" as const, label: "Start score", options: ["301", "501"] as const, default: "501" as const },
} as const;

export const darts501Plugin: GamePlugin<Darts501State, Darts501Action, typeof darts501Settings> = {
  id: "darts-501",
  title: "Darts 501",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Count down from 501 to exactly zero. Aim for trebles, watch the bust line.",
  howToPlay: `Darts 501 is the classic pub darts format. You start at 501 (or 301) and must reduce your score to exactly zero. Going below zero — or landing on 1 — is a bust and your score reverts for that dart.

Three controls govern each throw. Aim Horizontal and Aim Height position your crosshair on the board — visible as a yellow dot. Keep both at 50% to target the bullseye. Move the horizontal aim toward the left or right edge to target the outer sectors. Power/Precision determines how tightly your dart clusters around the aim point; higher power means less scatter.

The board has key scoring zones: the thin outer ring doubles the sector value, the thin inner ring triples it. The small green circle is the 25 (single bull) and the red center dot is the bullseye (50, double bull). Treble-20 scores 60 and is the standard high-scoring target.

Strategy: aim for T20 (treble 20) until you get close to zero, then switch to the double-ring to finish cleanly. Landing on 2 lets you finish with double-1. A bust doesn't end the game — you just lose that dart's score.

Scoring: fewer darts equals a higher score. The legendary nine-dart finish (9 darts to complete 501) scores 1000. Pro players average around 17–22 darts. Can you beat that?`,
  settings: darts501Settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-darts-501-action"]', pulses: 3 }; },
  component: Darts501,
};
