import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GreatWallQuizState, GreatWallQuizAction, GreatWallQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GreatWallQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const greatWallQuizPlugin: GamePlugin<GreatWallQuizState, GreatWallQuizAction, typeof settings> = {
  id:"great-wall-quiz", title:"Great Wall of China Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Great Wall's history, scale, and dynasties.",
  howToPlay:`Great Wall of China Quiz tests your knowledge of humankind's most ambitious construction project. Questions cover the Wall's 21,000+ kilometers of defensive structures spanning northern China, with sections built across multiple dynasties — Qin, Han, Ming, and others.

You'll be quizzed on the Wall's primary purpose (defense from northern nomadic invasions), the materials used (stone, brick, tamped earth, wood), construction labor over centuries that involved millions of workers, and the famous beacon tower system used for signaling. Tourist destinations like Badaling and Mutianyu come up, as does the Wall's 2007 inclusion among the New Seven Wonders of the World, plus the famous misconception about visibility from space (no, you can't really see it from low orbit without serious magnification).

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Climb to the top of the leaderboard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GreatWallQuizSettings),
  reducer,isTerminal,component:GreatWallQuizGame,
};
