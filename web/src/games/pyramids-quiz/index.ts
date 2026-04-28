import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PyramidsQuizState, PyramidsQuizAction, PyramidsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PyramidsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pyramidsQuizPlugin: GamePlugin<PyramidsQuizState, PyramidsQuizAction, typeof settings> = {
  id:"pyramids-quiz", title:"Egyptian Pyramids Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the pyramids of Giza and ancient Egypt.",
  howToPlay:`Egyptian Pyramids Quiz tests your knowledge of the most enduring monuments of antiquity. Questions cover the pyramids of Giza — the Great Pyramid of Khufu (the largest), Khafre (with its preserved cap), and Menkaure — along with the Sphinx that stands guard nearby. You'll be quizzed on construction estimates (about 2.3 million blocks!), the labor force (skilled paid workers, not slaves), and the famous 3,800+ year run as the world's tallest structure.

Topics include the older Step Pyramid of Djoser at Saqqara, the Bent Pyramid, the role of pyramids as royal tombs, internal burial chambers, and the precise alignment of the Great Pyramid to true north. The Seven Wonders of the Ancient World — and the pyramids' status as the only one still standing — make appearances. Mayan and Aztec pyramid traditions in the Americas may also surface.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Time to march like an Egyptian!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PyramidsQuizSettings),
  reducer,isTerminal,component:PyramidsQuizGame,
};
