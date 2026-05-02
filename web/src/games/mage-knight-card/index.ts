import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MageKnightCardState, MageKnightCardAction, MageKnightCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MageKnightCardGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const mageKnightCardPlugin: GamePlugin<MageKnightCardState, MageKnightCardAction, typeof settings> = {
  id: "mage-knight-card",
  title: "Mage Knight Card",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tactical adventure deck-builder.",
  howToPlay: "Mage Knight Card is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MageKnightCardSettings),
  reducer,
  isTerminal,
  component: MageKnightCardGame,
};

export default mageKnightCardPlugin;
