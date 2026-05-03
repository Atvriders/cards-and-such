import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WattenState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Watten } from "./Watten.js";

const wattenSettings = {} as const;
type WattenSettings = SettingsOf<typeof wattenSettings>;
type WattenAction = { type: "play"; cardId: string };

export const wattenPlugin: GamePlugin<WattenState, WattenAction, typeof wattenSettings> = {
  id: "watten",
  title: "Watten",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alpine 4-player trick game with trump — 1v1 duel here.",
  howToPlay: `Watten is an Alpine four-player trick-taking game played in Bavaria, Austria, and South Tyrol with a 32-card pack. This simplified 1v1 duel uses spades as trump and a 32-card stripped pack (7, 8, 9, 10, J, Q, K, A in each suit). You and the bot each receive 5 cards. Each trick: follow the led suit if able, otherwise play any card. Highest spade wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Watten the Critical (chosen rank) and Right (Heart-King in some variants) are permanent trumps regardless of suit. This duel skips that. Score is tricks taken — capture 3 of 5 tricks to win. Watten’s short hand makes every card decisive: lead aces only when you must commit.`,
  settings: wattenSettings,
  initialState: (seed: number, _settings: WattenSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-watten-hand"]', pulses: 3 };
      return null;
    },
  component: Watten,
};
