import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RookState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Rook } from "./Rook.js";

const rookSettings = {} as const;
type RookSettings = SettingsOf<typeof rookSettings>;
type RookAction = { type: "play"; cardId: string };

export const rookPlugin: GamePlugin<RookState, RookAction, typeof rookSettings> = {
  id: "rook",
  title: "Rook",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic trick-taking game — set-trump duel here.",
  howToPlay: `Rook is a classic American trick-taking card game traditionally played with a special Rook pack containing four colors (numbered cards) and a Rook bird card. This simplified duel uses a standard 52-card deck with diamonds as trump. You and the bot each receive 12 cards. Each trick: follow the led suit if able, otherwise play any card. Highest diamond wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Rook, the Rook bird is a wild trump and the 5s are high-value point cards. This version simplifies to straight trick-play: count diamonds, lead long side suits early to flush trumps, then cash your aces. Score is tricks taken — capture 7 of 12 tricks to win the round.`,
  settings: rookSettings,
  initialState: (seed: number, _settings: RookSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-rook-hand"]', pulses: 3 };
      return null;
    },
  component: Rook,
};
