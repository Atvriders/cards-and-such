import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SculptureQuizState, SculptureQuizAction, SculptureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SculptureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sculptureQuizPlugin: GamePlugin<SculptureQuizState, SculptureQuizAction, typeof settings> = {
  id:"sculpture-quiz", title:"Sculpture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sculpture from Michelangelo to Rodin to Henry Moore and modern installations.",
  howToPlay:`Sculpture Quiz spans three thousand years of three-dimensional art. From classical Greece and Rome through Donatello, Michelangelo, and Bernini, on into the modern era of Rodin, Brancusi, Henry Moore, Calder, Giacometti, and contemporary installation artists like Anish Kapoor and Yayoi Kusama — expect questions on materials, locations, signature works, and the artists who carved, cast, and shaped them.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 per second remaining on the clock. Wrong answers earn nothing.

Tap a choice and press Submit. Correct choices glow green; wrong ones turn red, and the right answer is revealed before you continue. Press Next to advance.

Choose 10, 20, or 30 questions in Settings. Whether you've stood before David in Florence or Cloud Gate in Chicago, this quiz will test your eye!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SculptureQuizSettings),
  reducer,isTerminal,component:SculptureQuizGame,
};
