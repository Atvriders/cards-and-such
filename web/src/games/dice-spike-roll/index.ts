import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpikeRollState, DiceSpikeRollAction, DiceSpikeRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpikeRollGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpikeRollPlugin: GamePlugin<DiceSpikeRollState, DiceSpikeRollAction, typeof settings> = {
  id: "dice-spike-roll", title: "Dice Spike Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll 2 dice — matching pairs double your score, and double-sixes triple it!",
  howToPlay: `Dice Spike Roll rewards lucky pairs. Each round you roll two six-sided dice. Your score equals the sum of both dice — but if they match, your score doubles, and if both show 6, it triples!

A normal roll scores 2-12. A pair scores 4-24. A double-six spikes to 36! Over 10 or 20 rounds, lucky spike rolls can catapult your total.

A pair occurs 1 in 6 times; double-six occurs 1 in 36. Simple, fast, and exciting when the spikes appear!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceSpikeRollSettings),
  reducer, isTerminal, component: DiceSpikeRollGame,
};
