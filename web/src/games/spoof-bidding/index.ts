import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoofBiddingState, SpoofBiddingAction, SpoofBiddingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpoofBiddingGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const spoofBiddingPlugin: GamePlugin<SpoofBiddingState, SpoofBiddingAction, typeof settings> = {
  id: "spoof-bidding",
  title: "Spoof Bidding",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Spoof: bid total of hidden coins held by all players; bluffing matters.',
  howToPlay: 'Spoof Bidding is a real, dice-driven simulation. Spoof: bid total of hidden coins held by all players; bluffing matters.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpoofBiddingSettings),
  reducer,
  isTerminal,
  component: SpoofBiddingGame,
};
