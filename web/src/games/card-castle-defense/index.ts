import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCastleDefenseState, CardCastleDefenseAction, CardCastleDefenseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCastleDefenseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCastleDefensePlugin: GamePlugin<CardCastleDefenseState, CardCastleDefenseAction, typeof settings> = {
  id:"card-castle-defense", title:"Card Castle Defense", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Defend the castle with face cards (J/Q/K). 8 rounds.",
  howToPlay:"Card Castle Defense is an 8-round card mini. The castle is under siege; each round, you draw a defender card. Face cards (Jack, Queen, King) are mighty defenders and successfully repel the attack for 10 points each. Aces and number cards (2-10) are not strong enough — the wall takes some damage, no points scored.\n\nThe probabilities: 12 of 52 cards are face cards (roughly 23%). Across 8 rounds, average expected scores are around 18 points; a strong defense streak can push you to 50 or 60.\n\nThere's no skill or choice — just press Draw, watch the card, and see whether your defender holds the castle. The Aces here are demoted; in this game's logic, they represent mounted attackers, not defenders. Press Next after each round and see how well your castle stood up at the end!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCastleDefenseSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-castle-defense-primary"]', pulses: 3 }), component:CardCastleDefenseGame,
};
