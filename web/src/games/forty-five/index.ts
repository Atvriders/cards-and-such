import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyFiveState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FortyFive } from "./FortyFive.js";

const fortyFiveSettings = {} as const;
type FortyFiveSettings = SettingsOf<typeof fortyFiveSettings>;
type FortyFiveAction = { type: "play"; cardId: string };

export const fortyFivePlugin: GamePlugin<FortyFiveState, FortyFiveAction, typeof fortyFiveSettings> = {
  id: "forty-five",
  title: "Forty-Five",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Irish partnership trick game — simplified to a 1v1 duel.",
  howToPlay: `Forty-Five is the Irish partnership trick-taking game from which Spoil Five evolved, played to a target of 45 points. This simplified 1v1 duel preserves the 5-card hand and trick-play core with diamonds as trump. You and the bot each receive 5 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card. Highest diamond wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: with only 5 tricks per round, save your aces and trumps for the right moments. Lead long side suits to force commitment. Score is tricks taken — capture 3 of 5 tricks to win the round and gain progress toward the symbolic 45-point match.`,
  settings: fortyFiveSettings,
  initialState: (seed: number, _settings: FortyFiveSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: FortyFive,
};
