import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  AggravationFullState, AggravationFullAction, AggravationFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const AggravationFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.AggravationFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "dummy", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const aggravationFullPlugin: GamePlugin<AggravationFullState, AggravationFullAction, typeof settings> = {
  id: "aggravation-full",
  title: "Aggravation (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Full-rulebook Aggravation — race four marbles around the cross-board against three CPUs, with the center shortcut.",
  howToPlay:
    "Aggravation (Full) is the cross-board marble race made famous by the CO-5 set. You play as RED (seat 0); BLUE, GREEN and YELLOW are CPU bots.\n\n" +
    "Each player has 4 marbles that begin in BASE. On your turn click 'Roll die' to roll a single six-sided die. Only a 6 releases a marble from BASE onto your START square; bumping any opponent there sends it home. Rolling a 6 grants a bonus roll (up to 3 in a row).\n\n" +
    "Marbles travel clockwise around a 64-square outer ring. Land on an opponent's marble (on the ring or in the central shortcut) and they go back to BASE. You may NOT land on your own marble. After a full loop your marble peels off onto your HOME COLUMN — four spots leading to HOME. You must land in HOME exactly: overshoots are illegal.\n\n" +
    "★ THE SHORTCUT: each player has a star-marked SHORTCUT ENTRY square on their side of the ring. If you roll the EXACT number to land on your shortcut entry square, you may dive into the central cross instead of staying on the ring. Five center cells form an X; advancing through them pops you out on the opposite side of the board, saving roughly half a lap. Captures still work inside the cross. Each move that lands on your shortcut entry shows two buttons: 'Move' (stay on ring) and 'Shortcut' (enter the cross).\n\n" +
    "First player with all four marbles HOME wins. Your final score = 100 + 10 × every opponent marble still not home, so dominating wins score higher.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AggravationFullSettings),
  reducer,
  isTerminal,
  hint: (state: AggravationFullState) => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "rolling") return { selector: "[data-testid=\"agf-roll\"]", pulses: 3 };
    if (state.phase === "moving") return { selector: "[data-testid=\"agf-action\"]", pulses: 3 };
    return null;
  },
  component: AggravationFullGame,
};
