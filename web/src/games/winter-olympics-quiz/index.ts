import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WinterOlympicsQuizState, WinterOlympicsQuizAction, WinterOlympicsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WinterOlympicsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const winterOlympicsQuizPlugin: GamePlugin<WinterOlympicsQuizState, WinterOlympicsQuizAction, typeof settings> = {
  id:"winter-olympics-quiz", title:"Winter Olympics Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Winter Olympics history, athletes, and cities.",
  howToPlay:`Winter Olympics Quiz tests your knowledge of the snowy and icy version of the Games. Questions span the history of the Winter Olympics from Chamonix 1924 to Beijing 2022 and beyond, covering host cities like Lake Placid, Sapporo, Calgary, Salt Lake City, Vancouver, Sochi, and PyeongChang.

You'll answer questions about figure skaters, alpine skiers, biathletes, hockey legends, and bobsled teams. Topics include the Miracle on Ice, Sonja Henie's three-peat, the Cool Runnings story, and the history of disciplines like skeleton, luge, curling, and ski jumping.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points per second remaining — speed matters. Wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, and the right answer is revealed before you continue.

Choose 10 or 20 questions in Settings. Whether you grew up watching the medals on a snowy weekend or you're a ski-jumping junkie, this quiz will bring the Olympic frost back to mind.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WinterOlympicsQuizSettings),
  reducer,isTerminal,component:WinterOlympicsQuizGame,
};
