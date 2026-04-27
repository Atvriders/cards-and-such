import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KaleKombatState, KaleKombatAction, KaleKombatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KaleKombatGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kaleKombatPlugin: GamePlugin<KaleKombatState, KaleKombatAction, typeof settings> = {
  id:"kale-kombat", title:"Kale Kombat", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click kale leaves attacking from sides! 30-second showdown arcade.",
  howToPlay:`Kale Kombat puts you in a 30-second battle against waves of kale leaves attacking from six lanes. Click each leaf before it disappears off the board. Every connect scores 10 points.\n\nThe board ticks once per second, spawning fresh leaves in random lanes. Leaves hang around for a few ticks before disappearing. The shorter their lifespan, the harder they are to catch — keep your eyes peeled across all lanes.\n\nThere's no skill ceiling: the more leaves you click in 30 seconds, the higher your score. Average runs land at 200-300 points; warriors past 500 are showing real combat reflexes.\n\nKale is the world's most virtue-signaling vegetable — and it tastes great. Click and conquer!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KaleKombatSettings),
  reducer,isTerminal,component:KaleKombatGame,
};
