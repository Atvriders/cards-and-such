import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeucesWildState, DeucesWildAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeucesWild } from "./Game.js";

export const deucesWildSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5, max: 100, step: 5, default: 25,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type DeucesWildSettingsType = SettingsOf<typeof deucesWildSettings>;

export const deucesWildPlugin: GamePlugin<DeucesWildState, DeucesWildAction, typeof deucesWildSettings> = {
  id: "deuces-wild",
  title: "Deuces Wild Video Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker where all 2s are wild. Build the best 5-card hand.",
  howToPlay: `Deuces Wild is a video poker variant where all four 2s serve as wild cards, substituting for any card to make the best possible hand.

Deal: You are dealt 5 cards. Choose which cards to hold by clicking them — the rest are discarded and replaced on the Draw.

Wild cards: Any 2 (deuce) is wild and can represent any card. This makes powerful hands more achievable, so the pay table is adjusted — pairs and two pair pay nothing; you need at least Three of a Kind to win.

Pay table (per bet unit): Natural Royal Flush 800x, Four Deuces 200x, Wild Royal Flush 25x, Five of a Kind 15x, Straight Flush 9x, Four of a Kind 5x, Full House 3x, Flush 2x, Straight 2x, Three of a Kind 1x.

Strategy tips: Always hold any deuces. With no deuces, hold any paying hand (three of a kind or better). With one deuce, hold four-card straight flushes, four of a kinds, full houses, and three of a kinds. Two pair without deuces does not pay — break it up and keep the higher pair.

Your score equals your final bankroll at session end.`,
  settings: deucesWildSettings,
  initialState: (seed: number, settings: DeucesWildSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "betting" || state.phase === "settled") return { selector: '[data-testid="hint-target-deuces-wild-deal"]', pulses: 3 };
      if (state.phase === "draw") return { selector: '[data-testid="hint-target-deuces-wild-draw"]', pulses: 3 };
      return null;
    },
  component: DeucesWild,
};
