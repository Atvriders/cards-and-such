import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DualNBackState, DNBAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DualNBack } from "./Game.js";

export const dualNBackSettings = {
  n: {
    kind: "enum" as const,
    label: "N Level",
    options: ["1", "2", "3"] as const,
    default: "2" as const,
  },
} as const;

type DNBSettings = SettingsOf<typeof dualNBackSettings>;

export const dualNBackPlugin: GamePlugin<DualNBackState, DNBAction, typeof dualNBackSettings> = {
  id: "dual-n-back",
  title: "Dual N-Back",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic working-memory test. Match both grid position and sound letter against N steps back.",
  howToPlay: `Dual N-Back is one of the most scientifically studied brain-training tasks, shown in research to improve fluid intelligence and working memory capacity when practiced regularly.

Each trial shows two things simultaneously: a highlighted cell in a 3x3 grid, and a letter displayed on screen (representing a spoken sound position). Your task is to decide whether the current cell matches the cell shown N trials ago (Position match), and whether the current letter matches the letter shown N trials ago (Sound match).

Press Position if the grid cell is the same as it was N steps back. Press Sound if the letter is the same. Both, one, or neither may match on any trial. After selecting, press Confirm to move to the next stimulus. You can toggle your selections on and off before confirming.

You earn 10 points for each correct hit and lose 5 points for each false alarm (pressing when there is no match). Missing a real match costs nothing extra beyond the missed points. The game runs 20 to 25 trials depending on your N setting.

Start with N=1 (one step back) to learn the rhythm, then advance to N=2 and N=3 as your performance improves. Focus on mentally rehearsing the last N items rather than memorizing the full history.`,
  settings: dualNBackSettings,
  initialState: (seed: number, settings: DNBSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".dnb-btn-primary", pulses: 3 }; },
  component: DualNBack,
};
