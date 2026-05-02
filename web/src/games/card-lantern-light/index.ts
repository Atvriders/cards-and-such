import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLanternLightState, CardLanternLightAction, CardLanternLightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardLanternLightGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardLanternLightPlugin: GamePlugin<CardLanternLightState, CardLanternLightAction, typeof settings> = {
  id:"card-lantern-light", title:"Card Lantern Light", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Light 12 lanterns. Cards 7 and higher light up; below 7 stay dark.",
  howToPlay:"Card Lantern Light is a 12-draw card mini set on a string of paper lanterns waiting to be lit. Each round draws a card. Cards 7 and above (7, 8, 9, 10, J, Q, K, A) successfully light the lantern and score 10 points. Cards 2 through 6 fizzle and the lantern stays dark for 0 points.\\n\\nThere's no choice or skill; you simply press Draw and see whether the lantern lights. With 8 of 13 ranks lighting up (~62%), expect to light about 7-8 of the 12 lanterns on an average run. That's 70-80 points typical. Light all 12 and score a perfect 120; an unlucky run might only score 30-40.\\n\\nEach card is drawn fresh with replacement from a 52-card deck. Press Draw to try the next lantern, then Next to move down the row. Light up the night and chase a top score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardLanternLightSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-lantern-light-primary"]', pulses: 3 }), component:CardLanternLightGame,
};
