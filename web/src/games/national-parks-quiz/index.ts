import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NationalParksQuizState, NationalParksQuizAction, NationalParksQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NationalParksQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nationalParksQuizPlugin: GamePlugin<NationalParksQuizState, NationalParksQuizAction, typeof settings> = {
  id:"national-parks-quiz", title:"National Parks Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of national parks around the world. 10 or 20 questions.",
  howToPlay:"National Parks Quiz tests your knowledge of the world's protected wild lands. The pool focuses heavily on the US National Park System \u2014 the world's first, established with Yellowstone in 1872 \u2014 but also pulls in iconic international parks (Banff, Serengeti, Kruger, Gal\u00e1pagos, Plitvice Lakes).\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nYou'll be tested on which states host which parks (Yellowstone is mostly in Wyoming, not Montana; the Grand Canyon is in Arizona, not Nevada), iconic features (Old Faithful, Half Dome), and international classics. Some questions trip people up: Death Valley straddles California and Nevada; Great Smoky Mountains spans North Carolina and Tennessee; Iguaz\u00fa Falls runs along the Argentina-Brazil border.\n\nChoose 10 or 20 questions in Settings. Whether you've hiked half of them or just dreamed of it, see how well your park-passport knowledge holds up!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NationalParksQuizSettings),
  reducer,isTerminal,
  hint: (state: NationalParksQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NationalParksQuizGame,
};
