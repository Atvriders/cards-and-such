import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrucoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const trucoSettings = {} as const;
type TrucoSettings = SettingsOf<typeof trucoSettings>;
type TrucoAction = { type: "play"; cardId: string };

export const trucoPlugin: GamePlugin<TrucoState, TrucoAction, typeof trucoSettings> = {
  id: "truco",
  title: "Truco",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Argentinian trick-taking card game with a unique card ranking system.",
  howToPlay: `Truco is Argentina's most beloved card game, played with a 40-card Spanish deck (Ace through 7, Jack, Queen, King — no 8, 9, or 10).

Setup: Each player receives 3 cards. You play one card per trick against the bot for 3 tricks total.

Card Ranking (highest to lowest): The unique Truco hierarchy makes low-number cards powerful. The top four "Pitos" are: Ace of Spades, Ace of Hearts, 7 of Diamonds, and 7 of Clubs. Then: 3s, 2s, remaining Aces, Kings, Queens, Jacks, 7s (Hearts/Spades), 6s, 5s, 4s.

Playing: Click any card in your hand to play it. The bot plays simultaneously. The stronger-ranked card wins the trick.

Scoring: Win 2 out of 3 tricks to win the round and earn 1 point. Tied tricks are shared. The player who wins more tricks overall wins the hand.

Strategy: Lead with mid-strength cards to gauge what the bot plays, saving your Pitos (top cards) to steal key tricks. If you hold the Ace of Spades or Ace of Hearts, you're almost guaranteed to win that trick!`,
  settings: trucoSettings,
  initialState: (seed: number, _settings: TrucoSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "player-turn") return { selector: '[data-testid="hint-target-truco-hand"]', pulses: 3 };
      return null;
    },
  component: Game,
};
