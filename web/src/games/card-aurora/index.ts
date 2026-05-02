import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardAuroraState, CardAuroraAction, CardAuroraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardAuroraGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardAuroraPlugin: GamePlugin<CardAuroraState, CardAuroraAction, typeof settings> = {
  id:"card-aurora", title:"Card Aurora", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Aurora-themed: pick rainbow suits with face-card bonuses. 12 rounds.",
  howToPlay:"Card Aurora paints the sky in rainbow colors — and your card pile in rainbow suits. Each round, six cards shimmer in the aurora. Pick a card from the round's target suit for a bigger reward (18 points), or any other suit for a smaller reward (8 points). If the card you pick is a face card (J, Q, K, A), you get a 5-point bonus on top.\n\nThe target suit changes every round randomly. Maximum per-round score is 23 (target suit + face card), and minimum is 8 (off-suit, low rank). Average rounds land around 12-15 points.\n\nYou play 12 rounds, so expected scores are typically 150-220, with good runs hitting 250+. Maximum theoretical: 276 (12 × 23, every round with a target-suit face card).\n\nThe aurora rewards both color discipline (matching the target suit) and the lucky strike of a face card. Whether you optimize for one or the other is up to your eyes — and your luck.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardAuroraSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-aurora-primary"]', pulses: 3 }), component:CardAuroraGame,
};
