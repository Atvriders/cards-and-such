import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PerudoState, PerudoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Perudo = /* @__PURE__ */ lazy(() => import("./Perudo.js").then((mod) => ({ default: mod.Perudo as unknown as React.ComponentType<unknown> })));
export const perudoSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
  startingDice: {
    kind: "enum" as const,
    label: "Starting Dice",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

type PerudoSettingsType = SettingsOf<typeof perudoSettings>;

export const perudoPlugin: GamePlugin<PerudoState, PerudoAction, typeof perudoSettings> = {
  id: "perudo",
  title: "Perudo",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bluff your way to victory with ones-as-wilds — bid, raise, or call Dudo!",
  howToPlay: `Perudo is a bluffing dice game where ones are wild. Each player starts with five dice hidden behind their cup.

Each round every player secretly rolls their dice. The starting player makes a bid: "I claim there are at least N dice showing face F across all players." Ones count as any face (wild) unless the bid itself is for ones. The next player must either raise the bid (higher count, or same count with a higher face) or call "Dudo!" to challenge.

When Dudo is called, all dice are revealed and the actual count (including wilds) is tallied. If the actual count meets or exceeds the bid, the bidder was honest — the challenger loses a die. If the actual count falls short, the bid was false — the bidder loses a die. The round ends and a new round begins with the loser going first.

Players eliminated when they lose all their dice. Last player with dice wins.

Tips: ones in your cup are extremely valuable as wildcards. Bid conservatively early when the total dice count is high. When the pool is small, challenge more aggressively.`,
  settings: perudoSettings,
  initialState: (seed: number, settings: PerudoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    return { selector: '[data-testid="hint-target-perudo-bid"]', pulses: 3 };
  },
  component: Perudo,
};
