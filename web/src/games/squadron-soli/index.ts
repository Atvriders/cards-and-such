import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SquadronSoliState, SquadronSoliAction, SquadronSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SquadronSoliGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const squadronSoliPlugin: GamePlugin<SquadronSoliState, SquadronSoliAction, typeof settings> = {
  id:"squadron-soli", title:"Squadron", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Squadron, a two-deck patience with reserve.",
  howToPlay:"Squadron Trivia is a ten-question quiz about Squadron, a two-deck patience using a reserve and a fan-style tableau of overlapping cards. The setup involves a tableau of ten columns and a small reserve area for parking single cards. Eight foundations are built up from Ace to King in suit. Tableau builds descend by alternating color, and only one card may be moved at a time unless a player counts free cells and empty columns to assemble multi-card moves. The stock deals one card at a time and there is no redeal. Each question tests rules, mechanics, and history of Squadron and adjacent two-deck patiences. Tap an answer and Submit; a correct answer earns 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. Press Next to continue. After ten questions your final score is displayed. Squadron is precise, calculation-heavy, and rewards careful planning of moves.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SquadronSoliSettings),
  reducer,isTerminal,component:SquadronSoliGame,
};
