import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RummikubFullAction, RummikubFullState } from "./state.js";
import { initialState, isTerminal, reducer } from "./state.js";

const RummikubFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.RummikubFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const rummikubFullSettings = {
  _dummy: {
    kind: "enum" as const,
    label: "Variant",
    options: ["ok"] as const,
    default: "ok",
  },
} as const;

type RummikubFullSettingsType = SettingsOf<typeof rummikubFullSettings>;

export const rummikubFullPlugin: GamePlugin<
  RummikubFullState,
  RummikubFullAction,
  typeof rummikubFullSettings
> = {
  id: "rummikub-full",
  title: "Rummikub (Full)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Tile-rummy that gets cutthroat once tiles hit the table: shuffle the runs and sets to find a place for your hand.",
  howToPlay: `Rummikub is played with 106 tiles: 1–13 in four colours (red, blue, orange, black), two copies of each, plus two jokers. Each of the four players starts with 14 tiles. You play against three computer opponents.

Goal: be the first to empty your hand.

On your turn you may either:
  - Place one or more valid melds, then "Commit turn"; or
  - "Draw tile" to take one tile from the pouch (this also ends your turn).

Valid melds:
  - Group: 3 or 4 tiles sharing the same number, all in different colours.
  - Run: 3 or more consecutive numbers in the same colour, length 3–13.

Initial meld (opening): the very first time you place tiles, the face value of the tiles you played must total at least 30. Until you open, you cannot touch the tableau — you must play out of your hand only.

After you have opened, you may also rearrange tiles already on the table. Select tiles from the table and tiles from your hand, then "Merge selection" to combine them into one new meld. Any meld that loses tiles must still be a legal meld (or it must be emptied entirely). Use "Reset turn" to roll back this turn's experiments if you get stuck.

Jokers act as any tile inside a meld. If a joker is on the table you may swap in the actual tile it stands for and reclaim the joker for your own meld. Jokers left in your hand at game's end count 30 points against you.

Scoring: when someone empties their hand, the winner scores the sum of every tile still in their opponents' hands. You score 0 if a CPU wins, or if the pouch empties out and nobody can play.

Advanced rules omitted: timed turns and the optional 3-minute clock are not enforced; rearrangements that would yield an interim invalid table are blocked rather than allowed during the turn.`,
  settings: rummikubFullSettings,
  initialState: (seed: number, settings: RummikubFullSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (isTerminal(state)) return null;
    if (state.turn !== 0) return null;
    // Suggest "Place new meld" if the player has selected tiles; otherwise
    // point at the draw button which is always safe.
    if (state.selectedHandIds.length >= 3) {
      return { selector: '[data-testid="rkf-place"]', pulses: 3 };
    }
    return { selector: '[data-testid="rkf-draw"]', pulses: 3 };
  },
  component: RummikubFullGame,
};
