import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFlipThreeState, CardFlipThreeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFlipThree } from "./CardFlipThree.js";

export const cardFlipThreeSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof cardFlipThreeSettings>;

export const cardFlipThreePlugin: GamePlugin<CardFlipThreeState, CardFlipThreeAction, typeof cardFlipThreeSettings> = {
  id: "card-flip-three",
  title: "Card Flip Three",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip three face-down cards each round and score points based on their values.",
  howToPlay: `Card Flip Three is a simple card-scoring game. Each round you are dealt three face-down cards. Click each card to flip it over and reveal its value.

Cards are scored by their face value: numbered cards score their number (2 scores 2, 9 scores 9), face cards (Jack, Queen, King) score 10, and Aces score 11. After flipping all three cards, click Next Round to continue.

Play continues for 5, 10, or 15 rounds depending on your settings. Your total score accumulates across all rounds.

The maximum possible score per round is 33 (three Aces), and the minimum is 6 (three 2s). Over 10 rounds, a perfect game totals 330 points.

Tips: There is no strategy — every flip is a reveal — so enjoy the suspense of what hides behind each card. Track whether you are ahead of the average pace (roughly 18 points per round assuming average card values) to gauge your luck.`,
  settings: cardFlipThreeSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (Array.isArray(state.revealed) && state.revealed.every((b: boolean) => b)) return { selector: '[data-testid="hint-target-card-flip-three-next"]', pulses: 3 };
    return null;
  },
  component: CardFlipThree,
};
