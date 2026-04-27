import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DisneyClassicsQuizState, DisneyClassicsQuizAction, DisneyClassicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DisneyClassicsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const disneyClassicsQuizPlugin: GamePlugin<DisneyClassicsQuizState, DisneyClassicsQuizAction, typeof settings> = {
  id:"disney-classics-quiz", title:"Disney Classics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Disney's animated classics — from Snow White to Moana.",
  howToPlay:`Disney Classics Quiz spans the entire history of Walt Disney Animation Studios, from 1937's 'Snow White and the Seven Dwarfs' through the Renaissance era of the 1990s and modern hits like 'Frozen' and 'Moana'. You'll be quizzed on princesses, villains, voice actors, songs, and the studio's biggest moments. Expect classics like 'Cinderella', 'The Lion King', 'Aladdin', 'Beauty and the Beast', and many more.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. The wonderful world of Disney awaits!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DisneyClassicsQuizSettings),
  reducer,isTerminal,component:DisneyClassicsQuizGame,
};
