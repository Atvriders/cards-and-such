import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThunderstoneQuestState, ThunderstoneQuestAction, ThunderstoneQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThunderstoneQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const thunderstoneQuestPlugin: GamePlugin<ThunderstoneQuestState, ThunderstoneQuestAction, typeof settings> = {
  id:"thunderstone-quest",
  title:"Thunderstone Quest",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dungeon-delve deckbuilder; recruit heroes, fight monsters.",
  howToPlay:"Thunderstone Quest is a ten-round dungeon-delve tribute to the deckbuilder family that pits heroes against scaling monsters. Each round, three cards reveal from a thematic deck: Hero (3), Weapon (4), Spell (5), Monster (2), Boss (6). The three cards' total is added to your score each round. ⚒️\n\nThe deck averages near 12 per round, with Boss cards producing the rare 15+ round. Heroes and Spells balance the curve. Across ten rounds expect totals between 100 and 130.\n\nPress Draw to flip three cards, Next to move to the next quest, and Finish on round ten. Aim for 130+ to declare yourself a Thunderstone champion. The whole game completes in well under a minute and captures the dungeon-delving rhythm of the original through a streamlined pocket version perfect for repeated plays.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ThunderstoneQuestSettings),
  reducer,
  isTerminal,
  component:ThunderstoneQuestGame,
};
