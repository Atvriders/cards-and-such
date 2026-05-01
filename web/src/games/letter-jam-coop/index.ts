import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetterJamCoopState, LetterJamCoopAction, LetterJamCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LetterJamCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const letter_jam_coop_plugin: GamePlugin<LetterJamCoopState, LetterJamCoopAction, typeof settings> = {
  id: "letter-jam-coop",
  title: "Letter Jam",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Word-clue cooperative deduction.",
  howToPlay: "Letter Jam is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LetterJamCoopSettings),
  reducer,
  isTerminal,
  component: LetterJamCoopGame,
};

export default letter_jam_coop_plugin;
