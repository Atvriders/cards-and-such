import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnookerSkillState, SnookerSkillAction, SnookerSkillSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SnookerSkillGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const snookerSkillPlugin: GamePlugin<SnookerSkillState, SnookerSkillAction, typeof settings> = {
  id: "snooker-skill",
  title: "Snooker Skill",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Snooker Skill: pot reds and colours in sequence to build a break.',
  howToPlay: 'Snooker Skill is a real, dice-driven simulation. Snooker Skill: pot reds and colours in sequence to build a break.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SnookerSkillSettings),
  reducer,
  isTerminal,
  component: SnookerSkillGame,
};
