import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorRecallState, ColorRecallAction, ColorRecallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ColorRecall } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const colorRecallPlugin: GamePlugin<ColorRecallState, ColorRecallAction, typeof settings> = {
  id:"color-recall", title:"Color Recall", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Watch a flashing color sequence and repeat it! Sequences grow longer with each success.",
  howToPlay:`Color Recall tests your visual memory. Each round a sequence of colored circles flashes one at a time. Watch carefully, then reproduce the sequence by clicking the matching color buttons.

Get the sequence right and it grows by one color next round — starting at 2 and potentially reaching much longer sequences. Get it wrong and the sequence shrinks by one (minimum 2). Each correct recall earns 50 points per color in the sequence.

Six colors are used: red, blue, green, yellow, purple, and orange. The sequence auto-advances every 0.8 seconds — watch the flashing circle carefully!

Use Settings to play 5 or 10 rounds. A skilled player can reach sequences of 8-10+ colors. Memory tip: try to narrate the colors as you watch, or chunk them into groups. Like Simon Says but with six colors — how far can your memory stretch?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColorRecallSettings),
  reducer, isTerminal, component:ColorRecall,
};
