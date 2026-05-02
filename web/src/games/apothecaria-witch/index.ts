import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaWitchState, ApothecariaWitchAction, ApothecariaWitchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApothecariaWitchGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const apothecariaWitchPlugin: GamePlugin<ApothecariaWitchState, ApothecariaWitchAction, typeof settings> = {
  id: "apothecaria-witch",
  title: "Apothecaria: Witch",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo witch-apothecary brewing campaign.",
  howToPlay: "Apothecaria: Witch is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaWitchSettings),
  reducer,
  isTerminal,
  component: ApothecariaWitchGame,
};

export default apothecariaWitchPlugin;
