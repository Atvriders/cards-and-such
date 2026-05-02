import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BossDiceState, BossDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BossDice } from "./BossDice.js";

export const bossDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7"] as const,
    default: "3",
  },
} as const;

type BossDiceSettingsType = SettingsOf<typeof bossDiceSettings>;

export const bossDicePlugin: GamePlugin<BossDiceState, BossDiceAction, typeof bossDiceSettings> = {
  id: "boss-dice",
  title: "Boss Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ship Captain Crew variant. Lock 6-5-4 across 3 rolls, then score your cargo. Highest total across rounds wins!",
  howToPlay: `Boss Dice is a multi-round variant of the classic Ship Captain Crew (6-5-4) dice game. Roll 5 dice up to 3 times per round to collect your Boss Crew — a 6 (ship), 5 (captain), and 4 (crew) — locked in that exact order.

Once all three are locked, your remaining two dice form your "cargo" — the sum of those two dice is your score for the round. You can keep rolling (up to 3 total) after locking the crew to try to improve your cargo. Or bank early if you're happy with what you have.

If you fail to secure 6-5-4 within 3 rolls, your cargo score for that round is 0.

After your turn, the bot plays optimally: it banks as soon as 6-5-4 is secured. Total cargo across all rounds is compared at the end.

Tips:
- If you get 6-5-4 on the first roll with cargo of 10+, consider banking.
- Re-rolling is only worth it if your current cargo is below 7 and you have rolls left.
- The bot will often score 5–8 per round; beating it requires consistent high cargo.

Play over 3, 5, or 7 rounds. The highest cumulative cargo wins!`,
  settings: bossDiceSettings,
  initialState: (seed: number, settings: BossDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BossDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roundOver") {
      return { selector: '[data-testid="hint-target-boss-dice-next"]', pulses: 3 };
    }
    if ((state.phase === "preRoll" || state.phase === "rolling") && state.current.rollsUsed < 3) {
      return { selector: '[data-testid="hint-target-boss-dice-roll"]', pulses: 3 };
    }
    if (state.phase === "rolling") {
      return { selector: '[data-testid="hint-target-boss-dice-bank"]', pulses: 3 };
    }
    return null;
  },
  component: BossDice,
};
