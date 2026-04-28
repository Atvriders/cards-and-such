import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CutthroatPinochleState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CutthroatPinochle } from "./CutthroatPinochle.js";

const cutthroatPinochleSettings = {} as const;
type CutthroatPinochleSettings = SettingsOf<typeof cutthroatPinochleSettings>;
type CutthroatPinochleAction = { type: "play"; cardId: string };

export const cutthroatPinochlePlugin: GamePlugin<CutthroatPinochleState, CutthroatPinochleAction, typeof cutthroatPinochleSettings> = {
  id: "cutthroat-pinochle",
  title: "Cutthroat Pinochle",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "No-partner Pinochle reduced to a one-on-one trick contest.",
  howToPlay: `Cutthroat Pinochle is the three-player, no-partners version of Pinochle. This duel reimagines the format as a head-to-head trick contest using the 48-card Pinochle deck (two copies of 9, 10, J, Q, K, A per suit). Diamonds are trump. You and the bot each receive 12 cards. Each trick, follow the led suit if able; otherwise play any card. Highest trump wins; otherwise highest of the led suit. Click cards to play. The trick winner leads next. Strategy: in Pinochle’s peculiar order Aces high then 10s, your 10s are second-tier, so cherish your trumps and aces. Lead long side suits to flush out trumps. Score is tricks taken; capture 7 of 12 tricks to win the round. Although melds and combinations are central to true Pinochle play, this version focuses on the trick-play heart of the game.`,
  settings: cutthroatPinochleSettings,
  initialState: (seed: number, _settings: CutthroatPinochleSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: CutthroatPinochle,
};
