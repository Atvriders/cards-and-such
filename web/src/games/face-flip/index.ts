import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceFlipState, FaceFlipAction, FaceFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FaceFlipGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const faceFlipPlugin: GamePlugin<FaceFlipState, FaceFlipAction, typeof settings> = {
  id:"face-flip", title:"Face Flip", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict whether the next card flipped is a face card. 12 rounds.",
  howToPlay:`Face Flip is a simple card-prediction mini. Each round, you predict whether the next single card flipped will be a face card (Jack, Queen, or King) or NOT a face card (any 2 through 10, or Ace).

A correct prediction scores 10 points. Wrong predictions score zero. There are 12 rounds in a game.

Probability tip: in a standard deck, there are 12 face cards out of 52, so face cards appear roughly 23% of the time, and non-face cards appear 77% of the time. If you always pick 'Not a face', you'd expect about 9 wins per 12 rounds — a respectable 90 points.

But picking face occasionally is the only way to score above ~90, since you need to be willing to take risk for high scores. Pure 'always not face' players win consistently around 80-100; bold players who pick face when they feel lucky can hit 100+ when their guts are right.

Watch the cards, trust your hunch, and tap your prediction!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FaceFlipSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-face-flip-primary"]', pulses: 3 }),component:FaceFlipGame,
};
