import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const onitamaCardsPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "onitama-cards",
  title: "Onitama (Cards)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Movement-card 5x5 abstract.",
  howToPlay: "Onitama is Shimpei Sato's elegant 5x5 abstract where movement cards control how pieces move. In this placement adaptation across 14 turns (7 each), you place pieces on the 5x5 grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Onitama has each player using two of five movement cards drawn at random; cards swap with the opponent after use. The card-swap mechanic is renowned for its elegance and depth — five cards from a deck of sixteen create thousands of game variations. This simplified placement version skips cards but uses the same 5x5 board. Onitama won the Mensa Select award in 2014 and remains a favorite among teaching parents. Strategy: claim the centre early. Final scoreboard: 100 points for the win, 25 for a tie. The full game's card-driven movement makes each round play feel different; this simplified version provides quick wins.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
