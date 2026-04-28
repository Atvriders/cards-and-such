import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnockoutWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnockoutWhist } from "./KnockoutWhist.js";

const knockoutWhistSettings = {} as const;
type KnockoutWhistSettings = SettingsOf<typeof knockoutWhistSettings>;
type KnockoutWhistAction = { type: "play"; cardId: string };

export const knockoutWhistPlugin: GamePlugin<KnockoutWhistState, KnockoutWhistAction, typeof knockoutWhistSettings> = {
  id: "knockout-whist",
  title: "Knockout Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Whist variant: lose a card from your hand each round you don't win.",
  howToPlay: `Knockout Whist is a Whist variant where the loser of each round drops a card from their hand the following round, slowly knocking weak players out. In this single-round duel you and the bot each begin with 7 cards — a typical mid-game hand size after a few knockouts. Hearts are trump. Each trick: follow the led suit if able, else play any card. Highest trump wins; otherwise highest of the led suit. Click cards to play. Strategy: short hands magnify the value of trumps and aces, so save them for the right moment. Lead a long side suit early to force the bot to commit. Trick winner leads the next round. Score equals tricks taken — take at least 4 of the 7 tricks to win the duel and avoid being knocked out yourself.`,
  settings: knockoutWhistSettings,
  initialState: (seed: number, _settings: KnockoutWhistSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: KnockoutWhist,
};
