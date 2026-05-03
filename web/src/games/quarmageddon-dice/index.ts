import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { QuarmageddonDiceState, QuarmageddonDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuarmageddonDice } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const quarmageddonDicePlugin: GamePlugin<QuarmageddonDiceState, QuarmageddonDiceAction, typeof settings> = {
  id: "quarmageddon-dice",
  title: "Quarmageddon Dice",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quarriors expansion — capture quarry to summon creatures.",
  howToPlay: "Quarmageddon Dice is a quick solo dice game. Quarriors expansion — capture quarry to summon creatures. Each round you roll five six-sided dice and score points based on the round's special twist: Roll 5 dice; capture quarry by counting dice >= 4; 10 rounds.\n\nPress the Roll button to throw all five dice. After they land you'll see the round's calculated score added to your total. Some rounds may pay nothing if the dice don't match the pattern; others can pay a hefty bonus.\n\nAim for the highest cumulative total over ten rounds. Strategy comes from understanding which patterns are most likely to score well — sums and matching pairs/triples are the most common scoring elements.\n\nWhen the tenth round ends, your final score is logged. Compare runs against your previous high scores. The dice are seeded so each session is reproducible — return to the exact same sequence by replaying with the same seed.\n\nSingle-player only. No CPU opponent — just you, the dice, and the scoring rules. A great filler for two minutes of casual play, with a satisfying push for higher and higher scores as you learn the patterns.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state: QuarmageddonDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-quarmageddon-dice-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-quarmageddon-dice-next"]', pulses: 3 };
    return null;
  },
  component: QuarmageddonDice,
};
