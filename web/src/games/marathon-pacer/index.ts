import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MarathonState, MarathonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarathonPacer } from "./Game.js";

export const marathonPacerPlugin = {
  id: "marathon-pacer",
  title: "Marathon Pacer",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Run a 10-mile mini marathon by balancing pace and energy. Surge for speed boosts or ease up to recover — finish strong without bonking!",
  howToPlay: `Marathon Pacer is a pacing strategy arcade game. You race through 10 miles and must balance speed against energy to finish with the best possible score.

Your runner advances automatically through each mile. A progress bar shows how far you are through the current mile, and your energy bar tracks your remaining fuel. Watch both carefully.

Two actions are available at any time: Surge spends energy and one of your 5 boost charges to sharply cut your pace (making you faster), and Ease Up gradually slows your pace while recovering some energy. Use Surge on downhills or flat sections; use Ease Up when energy is dangerously low.

Your pace is shown in minutes and seconds per mile. Your target pace is the optimal speed for today's conditions. Running much faster than your target drains energy quickly and can cause you to slow dramatically in later miles — the dreaded bonk.

Energy below 20% applies a severe pace penalty. Plan your surges early in the race and always keep some energy in reserve for the final miles.

Your score is built mile by mile — faster miles earn more points. Aim for 80+ to earn Marathon Master!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: MarathonState, action: MarathonAction) => MarathonState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-marathon-pacer-action"]', pulses: 3 }; },
  component: MarathonPacer,
} as unknown as GamePlugin;
