import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCupState, CardCupAction, CardCupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCupGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCupPlugin: GamePlugin<CardCupState, CardCupAction, typeof settings> = {
  id:"card-cup", title:"Card Cup", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Stack each card into the right cup by rank: 12 rounds.",
  howToPlay:"Card Cup is a 12-round rank-bucket card mini. Each round, a single random card is drawn and you must guess which cup it belongs in: Low (2-5), Mid (6-10), or High (J-Q-K-A). Correct cup picks score 20 points; wrong cups score zero.\n\nTap your cup before drawing. Once chosen, the card is revealed and the result shown. Low has 4 ranks, Mid has 5, High has 4. Mid is the largest bucket (5 of 13, about 38 percent), Low and High are roughly 31 percent each. With pure random calling, expected score across 12 rounds is around 80 points; smart distribution still leaves you near the same mark since you can only call one cup per round.\n\nPress Next to advance. Card Cup is a quick, breezy card mini that scratches the prediction itch without much commitment. Master the cup distribution mentally and rack up consistent points.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCupSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-cup-primary"]', pulses: 3 }), component:CardCupGame,
};
