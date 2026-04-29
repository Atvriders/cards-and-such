import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeartsLetterDiceState, HeartsLetterDiceAction, HeartsLetterDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HeartsLetterDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const heartsLetterDicePlugin: GamePlugin<HeartsLetterDiceState, HeartsLetterDiceAction, typeof settings> = {
  id: "hearts-letter-dice",
  title: "Hearts Letter Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spell HEARTS letters from dice values 1-6.",
  howToPlay: "Hearts (Dice) is the 1880s American dice game where the six faces represent the letters H, E, A, R, T, S in the word HEARTS. Players roll five dice and try to collect all six letters first. This variant scores partial spells. Across 12 rounds five dice are rolled. Predict the partial result: H+E (a 1 and 2 in the roll) pays +25, A+R+T (3, 4, and 5 all present) pays +35 — harder to assemble in five dice but rewards heavily, S only (a 6 with none of 1-5) pays +15 — narrow window, Bust (0). With five dice covering six letters, you often pick up four or five letters in a single roll; the trick is which subset triggers your call. Wrong call scores zero. Strategy: A+R+T occurs about 28% of the time across all five-dice rolls and pays best per attempt. Twelve rounds, top score wins. The original game required spelling H-E-A-R-T-S in order over multiple rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HeartsLetterDiceSettings),
  reducer,
  isTerminal,
  component: HeartsLetterDiceGame,
};
