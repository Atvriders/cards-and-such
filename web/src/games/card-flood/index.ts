import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFloodState, CardFloodAction, CardFloodSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFloodGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardFloodPlugin: GamePlugin<CardFloodState, CardFloodAction, typeof settings> = {
  id:"card-flood", title:"Card Flood", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards flood in. Rescue the right suit each round. 12 rounds.",
  howToPlay:"Card Flood is a suit-rescue game. Each round, six cards wash in like a river current. Your task is to grab a card matching the round's target suit — the one needing rescue from the flood. Match the target and earn 20 points; pick any other suit and you scrape together a consolation 5.\n\nThe target suit changes each round, randomly drawn from Spades, Hearts, Diamonds, or Clubs. The cards dealt are six random unique cards from a standard deck, so you're not always guaranteed to have a target-suit card available — sometimes the rescue is impossible and you grab whatever's nearest.\n\nYou play 12 rounds. Maximum score is 240 (12 × 20), and average runs land around 130-180. The strategy is simple: scan all six cards quickly, identify the target suit, and tap. Speed matters less than accuracy — there's no time pressure, just round counting.\n\nSave the suit, save the day!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardFloodSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-flood-primary"]', pulses: 3 }), component:CardFloodGame,
};
