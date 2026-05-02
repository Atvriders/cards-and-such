import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTarget25State, DiceTarget25Action, DiceTarget25Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTarget25 } from "./Game.js";

const diceTarget25Settings = {
  dice: { kind: "enum" as const, label: "Dice", options: ["3", "5"] as const, default: "5" as const },
} as const;

type DiceTarget25SettingsType = SettingsOf<typeof diceTarget25Settings>;

export const diceTarget25Plugin: GamePlugin<DiceTarget25State, DiceTarget25Action, typeof diceTarget25Settings> = {
  id: "dice-target-25",
  title: "Dice Target 25",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice and reroll to get as close to 25 as possible. Every pip away from 25 costs you points!",
  howToPlay: `Dice Target 25 is a push-your-luck dice game. Each round you start with an initial roll, then have two rerolls available to get your dice sum as close to 25 as possible.

After the first roll, click any dice you want to KEEP (they highlight green). Then press Roll to reroll the rest. You can do this up to two times. When you're satisfied, press Score.

Scoring: you earn 50 points minus 5 for every pip you are away from 25. An exact 25 scores 50 points! Being 5 away scores 25, and being 10+ away scores 0.

With 5 dice, perfect 25 is achievable — you need an average of 5 per die. Keeping high dice when you're above 25 or low dice when you're below helps zero in on target.

Use Settings to choose 3 or 5 dice. Play 5 rounds per game. Max score is 250 points. Strategy in keeping the right dice makes all the difference!`,
  settings: diceTarget25Settings,
  initialState: (seed: number, settings: DiceTarget25SettingsType) => initialState(seed, settings as DiceTarget25Settings),
  reducer,
  isTerminal,
  hint: (state: DiceTarget25State): HintTarget | null => {
    if (state.phase === "gameover") return null;
    if (state.phase === "scored") {
      return { selector: '[data-testid="hint-target-dice-target-25-next"]', pulses: 3 };
    }
    if (state.rollsLeft > 0) {
      return { selector: '[data-testid="hint-target-dice-target-25-roll"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-dice-target-25-score"]', pulses: 3 };
  },
  component: DiceTarget25,
};
