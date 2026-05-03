import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeepState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Seep } from "./Seep.js";

const seepSettings = {} as const;
type SeepSettings = SettingsOf<typeof seepSettings>;
type SeepAction = { type: "play"; cardId: string };

export const seepPlugin: GamePlugin<SeepState, SeepAction, typeof seepSettings> = {
  id: "seep",
  title: "Seep",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South-Asian capture trick game — 1v1 duel here.",
  howToPlay: `Seep is a South-Asian fishing-style trick-taking game. This simplified 1v1 duel preserves only the trick-play core with no trump. You and the bot each receive 13 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card. Highest card of the led suit wins (no trump). Click cards to play. Trick winner leads next. Strategy: in true Seep, captured high cards (especially aces and the 9 of spades) score points, and the goal is to capture the table. This duel simplifies to pure trick play. With no trump, lead long suits where you have aces, and short-suit yourself in suits where the bot is strong. Score is tricks taken — capture 7 of 13 tricks to win the round.`,
  settings: seepSettings,
  initialState: (seed: number, _settings: SeepSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-seep-hand"]', pulses: 3 };
      return null;
    },
  component: Seep,
};
