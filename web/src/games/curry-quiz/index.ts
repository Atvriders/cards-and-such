import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CurryQuizState, CurryQuizAction, CurryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CurryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const curryQuizPlugin: GamePlugin<CurryQuizState, CurryQuizAction, typeof settings> = {
  id:"curry-quiz", title:"Curry Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stir through Indian, Thai, and Japanese curries in thirty fragrant questions.",
  howToPlay:"Curry Quiz tests your knowledge of the world's most beloved spiced stews. Questions span the major traditions: Indian curries (tikka masala, vindaloo, korma, rogan josh, butter chicken), Thai curries (red, green, yellow, massaman, panang), Japanese curries (kare raisu, katsu curry), and adjacent cuisines like Sri Lankan, Malaysian rendang, and Caribbean curries. You'll see questions on signature spices — turmeric, cumin, coriander, cardamom, lemongrass, galangal, kaffir lime — and the regional ingredients that distinguish each style.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers light up green; wrong ones turn red and reveal the answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you grew up on Sunday curry, you're a Thai-takeout regular, or you melt your own Japanese curry blocks at home, this quiz delivers a heady whiff of curry knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CurryQuizSettings),
  reducer,isTerminal,component:CurryQuizGame,
};
