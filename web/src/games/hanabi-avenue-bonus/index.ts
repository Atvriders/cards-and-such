import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanabiAvenueBonusState, HanabiAvenueBonusAction, HanabiAvenueBonusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanabiAvenueBonusGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hanabiAvenueBonusPlugin: GamePlugin<HanabiAvenueBonusState, HanabiAvenueBonusAction, typeof settings> = {
  id: "hanabi-avenue-bonus",
  title: "Hanabi: Avenue Bonus",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bonus-rule Hanabi variant.",
  howToPlay: "Hanabi: Avenue Bonus is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanabiAvenueBonusSettings),
  reducer,
  isTerminal,
  component: HanabiAvenueBonusGame,
};

export default hanabiAvenueBonusPlugin;
