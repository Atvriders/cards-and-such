import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStepBetState, DiceStepBetAction, DiceStepBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStepBet } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceStepBetPlugin: GamePlugin<DiceStepBetState, DiceStepBetAction, typeof settings> = {
  id: "dice-step-bet", title: "Dice Step Bet", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll dice one at a time, building up your total. Bank your score before you go over 21 or bust!",
  howToPlay: `Dice Step Bet is a pressing dice game inspired by Blackjack. Each round starts at zero. Press Roll to add a die to your total. Keep rolling to push your score higher — but if your cumulative total exceeds 21, you bust and score zero for the round.

At any point after your first roll, press Bank to lock in your current total as points for that round. The catch: you might be sitting on 14 and wondering whether to risk another roll.

Strategy: rolling when low is almost always right (a 14 can only bust with 8+, which needs two dice), but rolling at 16 or 17 gets very risky. Know when to stop!

Play 5 or 10 rounds and accumulate points. The maximum per round is 21. See how often you can stay alive and bank a high total!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceStepBetSettings),
  reducer, isTerminal,
  hint: (state: DiceStepBetState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-step-bet-next"]', pulses: 3 };
    if (state.phase === "stepping" && state.runTotal >= 14) return { selector: '[data-testid="hint-target-dice-step-bet-bank"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-step-bet-roll"]', pulses: 3 };
  },
  component: DiceStepBet,
};
