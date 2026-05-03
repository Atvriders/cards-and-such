import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TycoonShedState, TycoonShedAction, TycoonShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TycoonShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TycoonShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tycoonShedPlugin: GamePlugin<TycoonShedState, TycoonShedAction, typeof settings> = {
  id: "tycoon-shed", title: "Tycoon", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese President variant — play strictly higher cards or pass.",
  howToPlay: "Tycoon is the Japanese take on the President or Daifugo card game family. In this two-player version each player receives seven cards. The first player leads any single card, and the other player must follow by playing a strictly higher card or pass. When both players pass in succession the trick clears and the last player to play leads again.\n\nThe first to empty their hand becomes the Tycoon for that round; the loser is the Beggar. Six rounds are played. The Tycoon scores twenty-five points; the Beggar gets none. There are no card-tax exchanges in this short version, so each round starts fresh.\n\nHolding two-and-three combos for late attacks works well, but the game is mostly tactical — knowing when to dump high cards instead of saving them. Average win-rate against the CPU lands around fifty per cent, so plan on roughly seventy-five points across the six rounds. A clean sweep would be a remarkable 150-point night.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TycoonShedSettings),
  reducer, isTerminal, 
  hint: (state: TycoonShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-tycoon-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-tycoon-shed-next"]', pulses: 3 };
    return null;
  },
  component: TycoonShedGame,
};
