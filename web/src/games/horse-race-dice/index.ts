import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorseRaceDiceState, HorseRaceDiceAction, HorseRaceDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorseRaceDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const horseRaceDicePlugin: GamePlugin<HorseRaceDiceState, HorseRaceDiceAction, typeof settings> = {
  id: "horse-race-dice",
  title: "Horse Race Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice and bet on the sum. 12 horses race; pick which advances most.",
  howToPlay: "Horse Race Dice is the classic family parlor game compressed to a single-bettor format. Twelve horses numbered 1-12 wait at the gate. Each round two dice roll. You choose one horse to bet on each round. If the dice sum equals your horse's number, your horse wins that round and you score.\n\nDifferent horses pay different amounts based on rarity: 7 pays 6 (most common, 6/36); 6 and 8 pay 8 each; 5 and 9 pay 10; 4 and 10 pay 13; 3 and 11 pay 18; 2 and 12 pay 36 (rarest, 1/36). All horses have equal expected value of about 1.0 per round.\n\nThe game runs 12 rounds. There are no rerolls. Average expected score across 12 rounds lands near 12 points (one hit on average, scaled by payout). Betting consistently on horse 7 will often produce 2-3 hits per game; betting on extreme horses 2 or 12 hits roughly once every 36 rolls but the payout is huge when it does.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HorseRaceDiceSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-horse-race-dice-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-horse-race-dice-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-horse-race-dice-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-horse-race-dice-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-horse-race-dice-next"]', pulses: 3 };
  },
  component: HorseRaceDiceGame,
};
