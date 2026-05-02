import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZombieDiceState, ZombieAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZombieDice } from "./ZombieDice.js";

export const zombieDiceSettings = {
  targetBrains: {
    kind: "enum" as const,
    label: "Brains to Win",
    options: ["7", "13", "20"] as const,
    default: "13",
  },
} as const;

type ZombieDiceSettingsType = SettingsOf<typeof zombieDiceSettings>;

export const zombieDicePlugin: GamePlugin<ZombieDiceState, ZombieAction, typeof zombieDiceSettings> = {
  id: "zombie-dice",
  title: "Zombie Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push-your-luck zombie game — collect brains, avoid 3 shotguns in a turn.",
  howToPlay: `You are a zombie. Eat brains. Avoid shotgun blasts. Zombie Dice is a fast push-your-luck game using 13 custom dice drawn from a pool.

The 13 dice come in three colours with different risk levels: Green (6 dice) — 3 brains, 2 runners, 1 shotgun; Yellow (4 dice) — 2 brains, 2 runners, 2 shotguns; Red (3 dice) — 1 brain, 2 runners, 3 shotguns.

Each turn: draw 3 random dice from the pool and roll them. Brains (eaten!) are set aside and count toward your turn total. Runners escape and are rolled again next time. Shotguns are collected — get 3 shotguns and your turn ends with zero brains banked.

After each roll you choose: bank your brains (safe!) or push your luck and roll again. When rolling again, keep your runners and draw fresh dice from the remaining pool to make 3 total. If the pool runs low, it is replenished.

Bank to add your turn's brains to your permanent total. First to reach the target (7, 13, or 20 brains) wins!

Tips: green dice are safe to chase. Red dice are treacherous — if you have 2 shotguns and mostly red dice left in the pool, banking is usually the smart play.`,
  settings: zombieDiceSettings,
  initialState: (seed: number, settings: ZombieDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-zombie-dice-nextTurn"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-zombie-dice-roll"]', pulses: 3 };
  },
  component: ZombieDice,
};
