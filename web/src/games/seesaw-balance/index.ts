import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeesawBalanceState, SeesawBalanceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeesawBalance } from "./SeesawBalance.js";

export const seesawBalanceSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Physics",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type SeesawBalanceSettingsType = SettingsOf<typeof seesawBalanceSettings>;

export const seesawBalancePlugin: GamePlugin<SeesawBalanceState, SeesawBalanceAction, typeof seesawBalanceSettings> = {
  id: "seesaw-balance",
  title: "Seesaw Balance",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place weighted balls on a seesaw to keep it balanced over 10 rounds!",
  howToPlay: `Seesaw Balance challenges you to keep a physical seesaw as level as possible over ten rounds. Each round a new ball with a random weight appears — weights range from 1 to 5. You must choose whether to place it on the left or right side of the seesaw.

The seesaw has real physics: it tilts based on the total weight difference between each side. The beam continuously rotates toward the heavier side. If the angle ever exceeds the danger threshold the seesaw tips completely and the game ends immediately.

Scoring rewards precision. Each round you earn up to 10 points depending on how balanced the seesaw is after you place the ball. A perfectly even difference earns the full 10 points. The wider the imbalance, the fewer points you score.

On easy difficulty the seesaw swings slowly, giving you time to think. Hard mode exaggerates the physics and the beam tips much faster.

Strategy matters: if your left side is currently heavier, place the next ball on the right to compensate. Keep mental track of cumulative left and right weight totals. Ten rounds go by quickly. Maximum possible score is 100 points — earned only by achieving perfect balance every round!`,
  settings: seesawBalanceSettings,
  initialState: (seed: number, settings: SeesawBalanceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-seesaw-balance-action"]', pulses: 3 }; },
  component: SeesawBalance,
};
