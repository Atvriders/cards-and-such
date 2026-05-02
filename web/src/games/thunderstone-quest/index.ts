import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThunderstoneQuestState, ThunderstoneQuestAction, ThunderstoneQuestSettings } from "./state.js";
import { ThunderstoneQuest_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { ThunderstoneQuestGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const thunderstoneQuestPlugin: GamePlugin<ThunderstoneQuestState, ThunderstoneQuestAction, typeof settings> = {
  id: "thunderstone-quest",
  title: "Thunderstone Quest",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dungeon-delving deck-builder.",
  howToPlay: "Thunderstone Quest is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThunderstoneQuestSettings),
  reducer,
  isTerminal,
  hint: (state: ThunderstoneQuestState): HintTarget | null => {
    const sel = coopHintSelector(state, ThunderstoneQuest_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ThunderstoneQuestGame,
};

export default thunderstoneQuestPlugin;
