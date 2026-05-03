import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PositionRecallState, PositionRecallAction, PositionRecallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PositionRecall } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const positionRecallPlugin: GamePlugin<PositionRecallState, PositionRecallAction, typeof settings> = {
  id:"position-recall", title:"Position Recall", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Grid cells light up in sequence — click them back in the same order! Harder with each success.",
  howToPlay:`Position Recall uses a 3x3 grid of nine cells. Each round a sequence of cells highlights in order. Watch which cells light up and in what sequence, then reproduce that sequence by clicking them.

Start with a 2-cell sequence. Each successful round adds another cell. Miss and the sequence shortens (minimum 2). Each correct round earns 60 points per cell in the sequence.

The cells flash automatically every 0.8 seconds. Focus on where the highlight appears — top-left, center, bottom-right, etc. As sequences grow longer, spatial memory techniques help: mentally map the path the highlight takes across the grid.

Use Settings to choose 5 or 10 rounds. Longer sequences demand strong spatial working memory. Reaching sequences of 7-8 positions on a 9-cell grid is impressive! This game directly exercises the visuospatial sketchpad component of working memory.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PositionRecallSettings),
  reducer, isTerminal, hint: (state: PositionRecallState): HintTarget | null => (state.phase === "input" ? { selector: ".memory-btn", pulses: 3 } : null), component:PositionRecall,
};
