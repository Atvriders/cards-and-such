import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const napWellingtonPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "nap-wellington",
  title: "Nap (Wellington)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Napoleon variant with Wellington declaration doubling stakes.",
  howToPlay: "Nap (Wellington) is the British trick-taking gambling game with the Wellington over-bid that doubles stakes. Across ten rounds you press Bid to declare a contract: Pass, Three, Four, Nap (5), or Wellington (5 doubled). Hidden from view, a random hand-strength is generated. If your bid is met or exceeded by the simulated trick count you score points equal to your bid (Wellington pays 10). If you fail you lose half your bid. The CPU bids simultaneously each round. Total points after ten rounds wins. Wellington is the more daring over-call; it pays double Nap but a fail loses double too. British pub-Nap players in working men's clubs play long Wellington rubbers all evening, with the over-bidder's confidence tested by every round. Bid carefully — over-bid Wellingtons rarely make. Press Bid to advance each round; the contract resolves immediately. Final scoreboard awards 100 points for the win, 25 for a tie. Strategy: pass on weak rounds, claim the win on strong ones.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
