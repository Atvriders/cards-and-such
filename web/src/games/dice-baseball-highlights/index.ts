import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceBaseballHighlightsState, DiceBaseballHighlightsAction, DiceBaseballHighlightsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBaseballHighlightsGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBaseballHighlightsPlugin: GamePlugin<DiceBaseballHighlightsState, DiceBaseballHighlightsAction, typeof settings> = {
  id: "dice-baseball-highlights",
  title: "Baseball Highlights",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Baseball Highlights: play 6 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Baseball Highlights is a real, dice-driven simulation. Baseball Highlights: play 6 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBaseballHighlightsSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBaseballHighlightsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-baseball-highlights-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-baseball-highlights-next"]', pulses: 3 };
    return null;
  },
  component: DiceBaseballHighlightsGame,
};
