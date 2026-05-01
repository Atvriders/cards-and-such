import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BidEuchreState, BidEuchreAction, BidEuchreSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BidEuchreGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bid-euPlugin: GamePlugin<BidEuchreState, BidEuchreAction, typeof settings> = {
  id: "bid-euchre",
  title: "Bid Euchre",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid Euchre — 24-card trump game.",
  howToPlay: "Bid Euchre — 24-card trump game. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BidEuchreSettings),
  reducer,
  isTerminal,
  component: BidEuchreGame,
};
