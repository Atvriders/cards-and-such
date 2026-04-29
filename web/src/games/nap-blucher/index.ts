import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const napBlucherPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "nap-blucher",
  title: "Nap (Blucher)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Napoleon variant with Blucher over-bid taking full pot.",
  howToPlay: "Nap (Blucher) is the trickier British Nap variant with the Blucher declaration: claim all five tricks for triple stakes and the full pot. Across ten rounds press Bid to declare: Pass, Three, Four, Nap (5), Wellington (5 doubled), or Blucher (5 tripled, takes pot). The hidden hand strength is randomly generated; bid resolves automatically. Blucher pays 15 if successful and -7 if failed; the highest-risk bid in pub-Nap canon. The CPU bids simultaneously each round. Total points after ten rounds wins. Blucher is named for the Prussian general who arrived just in time at Waterloo, mirroring how a Blucher bid arrives just in time to take the pot. Real Nap players will see one Blucher per evening, sometimes none. Press Bid to advance; the contract resolves immediately. Final scoreboard awards 100 points for the win, 25 for a tie. Strategy: pass on weak rounds, claim Wellington on solid hands, save Blucher for genuine power-hands. Most pub Nap nights end with the bold Blucher caller either rich or busted.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
