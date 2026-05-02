import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceFlushState, FaceFlushAction, FaceFlushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FaceFlushGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const faceFlushPlugin: GamePlugin<FaceFlushState, FaceFlushAction, typeof settings> = {
  id:"face-flush", title:"Face Flush", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round count Jacks/Queens/Kings in five dealt cards. Five faces is a rare jackpot.",
  howToPlay:`Face Flush is a no-decision lucky-draw card mini. Each round, five cards are dealt from a shuffled standard deck. Count how many of those cards are face cards — that is, Jacks, Queens, or Kings. Every face card scores 10 points. If all five cards happen to be face cards, you get a Face Flush — a 50-point jackpot bonus on top of the base 50.

There are 8 rounds. There's no in-round choice; the cards fall as they will. With twelve face cards in a 52-card deck, the expected number of face cards in five dealt cards is about 1.15, so most rounds you'll see one or two face cards (10 or 20 points). Three is a respectable round; four is exciting; the legendary five-card Face Flush is roughly a 1-in-2,300 hand.

Average final scores hover around 90; a hot run with several three-or-four-face hands can push past 200.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FaceFlushSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-face-flush-primary"]', pulses: 3 }),component:FaceFlushGame,
};
