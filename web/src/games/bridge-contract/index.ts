import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BridgeContractState, BridgeContractAction, BridgeContractSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BridgeContractGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const br-cPlugin: GamePlugin<BridgeContractState, BridgeContractAction, typeof settings> = {
  id: "bridge-contract",
  title: "Contract Bridge",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Bridge — 13 tricks, top of led suit takes.",
  howToPlay: "Heads-up Bridge — 13 tricks, top of led suit takes. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BridgeContractSettings),
  reducer,
  isTerminal,
  component: BridgeContractGame,
};
