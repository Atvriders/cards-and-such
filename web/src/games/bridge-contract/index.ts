import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BridgeContractState, BridgeContractAction, BridgeContractSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BridgeContractGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bridgeContractPlugin: GamePlugin<BridgeContractState, BridgeContractAction, typeof settings> = {
  id: "bridge-contract", title: "Contract Bridge", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Full contract bridge with bidding and partnership trick play.",
  howToPlay: "Contract Bridge is the most complex and prestigious trick-taking card game in the world, played by partnerships of two against two. Each player receives thirteen cards. The auction proceeds in rounds with players bidding the number of tricks beyond six they will take and the trump suit (or no-trump). The winning bid becomes the contract; the bid winner is declarer and dummy lays their cards face-up. Tricks are played in standard fashion with side suits and trumps. Scoring rewards making contract, doubles, slams (twelve or thirteen tricks), and vulnerability bonuses. In this duel against the CPU partnership across six rounds, click Play Round. Strategy: open one of a major with thirteen-plus high-card points, support partner's suit with three-card support, and double when your hand is too weak to bid but strong against the contract. Aim for at least three made contracts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BridgeContractSettings),
  reducer, isTerminal, component: BridgeContractGame,
};
