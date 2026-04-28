import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KniffelState, KniffelAction, KniffelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KniffelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kniffelPlugin: GamePlugin<KniffelState, KniffelAction, typeof settings> = {
  id:"kniffel", title:"Kniffel", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"German Yahtzee variant. 10 single-roll rounds; standard categories with German naming.",
  howToPlay:"Kniffel is the German Yahtzee variant, played with five dice across multiple rounds. This compact form distills it into 10 single-roll scoring rounds with automatic category selection.\n\nEach round you roll five dice once. The system identifies the best Kniffel category: Kniffel (5-of-a-kind) = 50, Vierling (4-of-a-kind) = sum of all dice, Großer Straße (Large Straight, 1-5 or 2-6) = 40, Kleiner Straße (Small Straight) = 30, Full House = 25, Drilling (3-of-a-kind) = sum, otherwise just dice sum.\n\n10 rounds total. Average expected score: 200-340 points. Kniffel scoring is essentially identical to Yahtzee, with categories named in German tradition. The single-roll format speeds up turns dramatically.\n\nA Kniffel on the first roll has odds of about 1 in 1,296. Most sessions you'll see 0-1 of them — the dramatic 50-point bonuses are what give Kniffel its iconic shouts of joy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KniffelSettings),
  reducer,isTerminal,component:KniffelGame,
};
