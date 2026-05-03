import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrucState, TrucAction, TrucSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrucGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trucPlugin: GamePlugin<TrucState, TrucAction, typeof settings> = {
  id: "truc", title: "Truc", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish/French bluffing trick game with raised stakes.",
  howToPlay: "Truc is a fast Spanish and French bluffing trick game played with a forty-card deck and only three cards per player. Card power is unusual — sevens of certain suits are top, then aces, threes, kings, queens, jacks, then numerics down to twos. You play three quick tricks per round but the highlight is the trucking call: at any point a player may raise the stakes from one to two, then to three, to four, or to game point. Either side may accept, reject (folding for the lower stake), or counter-raise. In this one-on-one duel, click Play Round to deal three cards, play the tricks, and resolve any truc bids. Strategy: bluff when your hand is mediocre, accept aggressively when holding a seven of clubs or coins. Aim to win at least four of six rounds for a strong score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrucSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-truc-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-truc-next"]', pulses: 3 };
    return null;
  }, component: TrucGame,
};
