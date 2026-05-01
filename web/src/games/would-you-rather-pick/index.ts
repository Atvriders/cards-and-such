import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WouldYouRatherPickState, WouldYouRatherPickAction, WouldYouRatherPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WouldYouRatherPickGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const would_you_rather_pick_plugin: GamePlugin<WouldYouRatherPickState, WouldYouRatherPickAction, typeof settings> = {
  id: "would-you-rather-pick",
  title: "Would You Rather",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hypothetical-pick prompts.",
  howToPlay: "Would You Rather solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WouldYouRatherPickSettings),
  reducer,
  isTerminal,
  component: WouldYouRatherPickGame,
};

export default would_you_rather_pick_plugin;
