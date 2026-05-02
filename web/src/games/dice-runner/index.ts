import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRunnerState, DiceRunnerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRunner } from "./DiceRunner.js";

export const diceRunnerSettings = {
  trackLength: {
    kind: "enum" as const,
    label: "Track Length",
    options: ["20", "30", "50"] as const,
    default: "30" as const,
  },
} as const;

type DiceRunnerSettingsType = SettingsOf<typeof diceRunnerSettings>;

export const diceRunnerPlugin: GamePlugin<DiceRunnerState, DiceRunnerAction, typeof diceRunnerSettings> = {
  id: "dice-runner",
  title: "Dice Runner",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice to sprint down a perilous track, dodge obstacles, and grab gems!",
  howToPlay: `Dice Runner is a dice-driven adventure game. You control a runner standing at the start of a tile-based track. Each tile is either safe ground, an obstacle, a gem pickup, or the finish line.

On your turn, click Roll Dice to throw two standard six-sided dice. Your runner advances by the total number of spaces. Landing on a safe tile earns movement points. Landing on a gem earns 50 bonus points. Landing on an obstacle costs you one hit point — you start with three. Losing all hit points ends the game.

If you reach or pass the finish tile you win! A finishing bonus of 200 points is awarded, plus 100 additional points for each gem collected along the way.

The track is procedurally generated so every game is different. Obstacles and gems are randomly distributed — about 20% of tiles are obstacles and 20% are gems. Longer tracks have more gems to collect but also more chances to take damage.

Score equals movement points plus gem bonuses plus the finishing bonus. Surviving without taking damage and collecting all gems is the key to a high score. Short tracks suit quick games; the 50-tile track is a full adventure!`,
  settings: diceRunnerSettings,
  initialState: (seed: number, settings: DiceRunnerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).won) return null;
    return { selector: '[data-testid="hint-target-dice-runner-roll"]', pulses: 3 };
  },
  component: DiceRunner,
};
