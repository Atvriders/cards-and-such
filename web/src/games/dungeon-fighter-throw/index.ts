import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DungeonFighterThrowState, DungeonFighterThrowAction, DungeonFighterThrowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DungeonFighterThrowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dungeonFighterThrowPlugin: GamePlugin<DungeonFighterThrowState, DungeonFighterThrowAction, typeof settings> = {
  id:"dungeon-fighter-throw",
  title:"Dungeon Fighter Throw",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dexterity-themed dice throwing.",
  howToPlay:"Dungeon Fighter Throw is a 10-round dexterity-themed dice game inspired by the cooperative target-throwing favorite. Each round, the target zone is the round number plus 8 (so round 1 = 9, round 10 = 18). You roll four dice and your sum must equal exactly the target to score 10 points, or be within 1 to score 5, or within 3 to score 2. Else 0. 🎯\n\nTough early on (low targets are hard with 4 dice), easier mid-game, hard again at the end. Maybe 4-6 scoring rounds per game. Across 10 rounds expect totals between 25 and 60.\n\nPress Roll to fling your dice at the dungeon target, then Next to advance. Each die's value is shown clearly with the target highlighted. Score 50+ to be a true Dungeon Fighter. The game finishes in well under a minute and captures the original's tense dexterity charm in a quick fantasy run.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DungeonFighterThrowSettings),
  reducer,
  isTerminal,
  component:DungeonFighterThrowGame,
};
