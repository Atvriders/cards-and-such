import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SevenTwentySevenShedState, SevenTwentySevenShedAction, SevenTwentySevenShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenTwentySevenShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sevenTwentySevenShedPlugin: GamePlugin<SevenTwentySevenShedState, SevenTwentySevenShedAction, typeof settings> = {
  id: "seven-twenty-seven-shed", title: "Seven-Twenty-Seven", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Adding-to-7/27 betting shedding.",
  howToPlay: "Seven-Twenty-Seven (or 7/27) is a split-pot betting game where the goal is to be closest to seven points or to twenty-seven points, with face cards counting as half. Aces are one or eleven.\n\nIn this single-player version you face the CPU across six rounds. Each round you are dealt two cards. You may stay or hit (draw additional cards) as in Blackjack. After both you and the CPU stand, the closest to seven wins half the round and closest to twenty-seven wins the other half.\n\nWinning a half pays ten points; winning both (a 'sweep') pays a total of twenty-five. Going over twenty-seven busts you out of the high split. Six rounds total. A strong score is around eighty.\n\nSeven-Twenty-Seven is popular at home poker nights as a between-game palate cleanser. The split-pot mechanic teaches strategic risk: do you go for the low (rare for two ends) or the high (riskier)? The game is luck-driven but the choice of which split to chase rewards thoughtful players. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenTwentySevenShedSettings),
  reducer, isTerminal, 
  hint: (state: SevenTwentySevenShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-seven-twenty-seven-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-seven-twenty-seven-shed-next"]', pulses: 3 };
    return null;
  },
  component: SevenTwentySevenShedGame,
};
