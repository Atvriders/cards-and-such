import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HalliGalliExtremeQuizState, HalliGalliExtremeQuizAction, HalliGalliExtremeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HalliGalliExtremeQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const halliGalliExtremeQuizPlugin: GamePlugin<HalliGalliExtremeQuizState, HalliGalliExtremeQuizAction, typeof settings> = {
  id:"halli-galli-extreme-quiz", title:"Halli Galli Extreme Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Halli Galli Extreme, the harder odd/even-total fruit slap memory variant.",
  howToPlay:"Halli Galli Extreme Trivia is a ten-question quiz about the spicier follow-up to the classic Halli Galli fruit-bell slap-card game. In Halli Galli Extreme, players ring the bell when the cumulative total of any fruit type is exactly five OR a specific odd/even pattern, with new card types raising the cognitive load. Each round you'll be tested on its publisher Amigo Spiele, the new mechanics, recommended players, and how it differs from the classic version. Tap your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is displayed. Halli Galli Extreme is loved for cranking the original up with stickier rules — see how much trivia about the bell-ringing brain-twister you can keep straight.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HalliGalliExtremeQuizSettings),
  reducer,isTerminal,component:HalliGalliExtremeQuizGame,
};
