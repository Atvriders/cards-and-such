import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmokState, OmokAction, OmokSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OmokGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const omokPlugin: GamePlugin<OmokState, OmokAction, typeof settings> = {
  id:"omok-quiz", title:"Omok Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Omok, the Korean five-in-a-row schoolyard classic.",
  howToPlay:"Omok is the Korean version of five-in-a-row, played on the 19x19 lines of a Baduk board with the same stones as Go. Omok is hugely popular in Korean schools as a quick alternative to Baduk: faster to learn, faster to finish, and adaptable to any Baduk set already in the room. While casual Omok plays without restrictions, competitive variants adopt rules similar to Renju to balance Black's first-move advantage.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OmokSettings),
  reducer,isTerminal,component:OmokGame,
};
