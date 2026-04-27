import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PinkFloydQuizState, PinkFloydQuizAction, PinkFloydQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PinkFloydQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pinkFloydQuizPlugin: GamePlugin<PinkFloydQuizState, PinkFloydQuizAction, typeof settings> = {
  id:"pink-floyd-quiz", title:"Pink Floyd Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Pink Floyd — Dark Side, The Wall, and progressive rock royalty.",
  howToPlay:`Pink Floyd Quiz tests your knowledge of the legendary progressive rock band. From Syd Barrett's psychedelic origins through 'The Dark Side of the Moon', 'Wish You Were Here', 'Animals', and 'The Wall', you'll be quizzed on members, songs, conceptual albums, and the iconic visuals — flying pigs, prisms, and giant inflatables — that made Pink Floyd unforgettable.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Welcome to the machine!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PinkFloydQuizSettings),
  reducer,isTerminal,component:PinkFloydQuizGame,
};
