import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AshesPhoenixbornState, AshesPhoenixbornAction, AshesPhoenixbornSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AshesPhoenixbornGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ashesPhoenixbornPlugin: GamePlugin<AshesPhoenixbornState, AshesPhoenixbornAction, typeof settings> = {
  id:"ashes-phoenixborn",
  title:"Ashes Phoenixborn",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dice-driven fantasy dueling.",
  howToPlay:"Ashes Phoenixborn is a 10-round dice-dueling game inspired by the fantasy card duel. Each round, you roll three power dice and the rival Phoenixborn rolls three threat dice. The higher sum wins; you score the difference times 2 if you win, zero if you lose, and 1 on a tie. 🔥\n\nThe matchup is even, so expect to win about half the rounds. Across 10 rounds, expect totals between 25 and 50. Big wins of 6+ pips of advantage are exhilarating.\n\nPress Roll to engage the duel, then Next to advance to the next round. Your dice glow blue, the rival's red. Score 45+ to claim Phoenixborn supremacy. The compact display shows both sides. The game embodies the original's roll-and-counter rhythm in a quick fantasy duel finishing in well under a minute — perfect for a snappy fantasy fix any time you need a quick gaming break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AshesPhoenixbornSettings),
  reducer,
  isTerminal,
  component:AshesPhoenixbornGame,
};
