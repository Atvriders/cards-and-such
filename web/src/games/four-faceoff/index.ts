import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FourFaceoffState, FourFaceoffAction, FourFaceoffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FourFaceoffGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fourFaceoffPlugin: GamePlugin<FourFaceoffState, FourFaceoffAction, typeof settings> = {
  id:"four-faceoff", title:"Four Faceoff", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Find the fours! Each 4 drawn earns 25 points.",
  howToPlay:"Four Faceoff is a 14-draw card mini that hunts fours. Each draw flips one card from a 52-card deck, and every 4 revealed scores 25 points.\n\nThere are four fours in a deck, so the theoretical maximum is 100 points; realistic runs land between 0 and 75. There's no skill ceiling — pure luck, pure draw. The game is short and breezy, ideal for a quick distraction.\n\nPast cards collect into a small ribbon under the current card so you can review the run at a glance. The score updates immediately when a 4 lands. Other cards contribute nothing.\n\nThe game ends after 14 draws and locks your score automatically. There's no penalty for missing fours — non-matches simply pass. Hit Draw, watch the cards, and chase the fours. Best of luck!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FourFaceoffSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-four-faceoff-primary"]', pulses: 3 }),component:FourFaceoffGame,
};
