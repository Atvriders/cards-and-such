import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LiarsDiceFullState, LiarsDiceFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const LiarsDiceFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.LiarsDiceFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const liarsDiceFullSettings = {
  startingDice: {
    kind: "enum" as const,
    label: "Starting dice",
    options: ["3", "4", "5"] as const,
    default: "5" as const,
  },
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type SettingsType = SettingsOf<typeof liarsDiceFullSettings>;

export const liarsDiceFullPlugin: GamePlugin<
  LiarsDiceFullState,
  LiarsDiceFullAction,
  typeof liarsDiceFullSettings
> = {
  id: "liars-dice-full",
  title: "Liar's Dice (Full Bluff Match)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Hidden-dice bluffing: bid higher or call the liar; lose a die when wrong.",
  howToPlay: `Four players each start with five hidden dice. After every player rolls in secret, the player to the dealer's left makes the first bid — a claim of the form "at least N dice showing face F" across ALL dice in play.

On your turn you must either raise the bid (more dice OR the same count with a higher face) or call "Liar!". When called, every die is revealed and the claimed face is counted. Ones act as wildcards and count toward any other face, so when bid face is e.g. "fives" each 1 also counts as a five. If the bid face IS ones, only literal ones count.

If the actual count meets or exceeds the bid the caller loses a die; otherwise the bidder loses one. When you reach zero dice you're eliminated. The last player with dice wins.

Three CPU bluffers play with a probabilistic Hurwicz-style policy: they form a belief about hidden dice using their own dice plus the expected distribution, then mix optimism and pessimism to choose between calling and raising. Higher difficulty leans more accurate.

Scoring: 200 + 60 × surviving dice when you win.`,
  settings: liarsDiceFullSettings,
  initialState: (seed: number, settings: SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: LiarsDiceFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    const bid = state.currentBid;
    if (!bid) {
      return { selector: '[data-testid="liars-dice-full-bid-submit"]', pulses: 3 };
    }
    // Rough probability: own matches + 2/6 of hidden (or 1/6 when bid face is 1)
    const myDice = state.diceBySeat[0]!;
    let total = 0;
    for (const arr of state.diceBySeat) total += arr.length;
    const hidden = total - myDice.length;
    const myCount =
      bid.face === 1
        ? myDice.filter((d) => d === 1).length
        : myDice.filter((d) => d === bid.face || d === 1).length;
    const p = bid.face === 1 ? 1 / 6 : 2 / 6;
    const expected = myCount + hidden * p;
    if (bid.count > expected * 1.35) {
      return { selector: '[data-testid="liars-dice-full-call"]', pulses: 3 };
    }
    return { selector: '[data-testid="liars-dice-full-bid-submit"]', pulses: 3 };
  },
  component: LiarsDiceFullGame,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #4a2615, #6b3a1e 50%, #2d160a)",
    accent: "rgba(245, 158, 11, 0.5)",
  },
};
