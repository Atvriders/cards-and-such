import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FamilyGuyState, FamilyGuyAction, FamilyGuySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FamilyGuyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const familyGuyQuizPlugin: GamePlugin<FamilyGuyState, FamilyGuyAction, typeof settings> = {
  id:"family-guy-quiz", title:"Family Guy Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Family Guy: Quahog's most chaotic family.",
  howToPlay:"Family Guy Quiz tests your knowledge of Seth MacFarlane's irreverent animated sitcom about the Griffin family of Quahog, Rhode Island. Questions cover Peter, Lois, Chris, Meg, Stewie, and Brian, plus the rich roster of friends, neighbors, and recurring oddballs — Quagmire, Cleveland, Joe, Herbert, Adam West, the Giant Chicken, and beyond.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10, 20, or 30 questions in Settings. Giggity!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FamilyGuySettings),
  reducer,isTerminal,component:FamilyGuyQuizGame,
};
