import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnightsQuizState, KnightsQuizAction, KnightsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnightsQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const knightsQuizPlugin: GamePlugin<KnightsQuizState, KnightsQuizAction, typeof settings> = {
  id:"knights-quiz", title:"Knights Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of medieval knights, chivalry, the Crusades, and castle life.",
  howToPlay:`Knights Quiz tests your knowledge of medieval Europe's warrior nobility. Questions cover the code of chivalry, the stages of becoming a knight (page, squire, knight), the Crusades, famous orders like the Knights Templar and Hospitaller, jousting tournaments, heraldry, castle design, and legendary figures like King Arthur and Richard the Lionheart.

Each question offers four choices. The correct one turns green; a wrong pick turns red. Press Next to continue.

Each correct answer earns 10 points. Choose 5, 10, or 15 questions in Settings.

Key facts: dubbing was the knighting ceremony; the destrier was the war horse; chivalry governed knight behavior; the First Crusade captured Jerusalem in 1099; the Fourth Crusade sacked Constantinople. The lance was used for jousting and the heater shield became standard in the later medieval period. Know these and you will conquer the quiz!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KnightsQuizSettings),
  reducer,isTerminal,component:KnightsQuizGame,
};
