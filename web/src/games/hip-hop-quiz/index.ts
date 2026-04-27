import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HipHopQuizState, HipHopQuizAction, HipHopQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HipHopQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hipHopQuizPlugin: GamePlugin<HipHopQuizState, HipHopQuizAction, typeof settings> = {
  id:"hip-hop-quiz", title:"Hip Hop Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hip hop history: from Tupac and Biggie to Jay-Z, Kanye, and beyond.",
  howToPlay:`Hip Hop Quiz tests your knowledge of rap history, from the Bronx block parties of the late '70s through golden-era Queens, '90s East-vs-West, southern crunk, conscious hip-hop, and modern trap. Questions cover Tupac, Biggie, Jay-Z, Nas, Kanye, Eminem, Drake, Kendrick Lamar, and the labels, beats, and battles that built the culture.

You have 15 seconds per question. Correct answers award 100 base points plus 10 points per second remaining on the clock. Speed matters — answer quickly for top scores. Wrong answers earn no points.

Tap a choice and press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is revealed before you advance. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Heads up — bars, beats, and history all in play!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HipHopQuizSettings),
  reducer,isTerminal,component:HipHopQuizGame,
};
