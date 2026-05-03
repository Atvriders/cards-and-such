import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const nardiRussianRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "nardi-russian-race",
  title: "Russian Nardi (Short)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian Backgammon: no hitting — block all opponent pieces to win.",
  howToPlay: "Russian Backgammon, also known as Short Nardi, is played on the standard 24-point board but with no hitting allowed. Instead, victory comes from racing all your fifteen checkers home and bearing them off, or from completely blocking your opponent's progress.\n\nIn this single-player simplification you play white against a random CPU. Click Roll to throw two six-sided dice, then click any of your checkers to advance it by either die or by the combined sum. Each die value can be used once per turn.\n\nThe track is shown horizontally as 25 cells; cell 24 is the bear-off zone. Bear off every one of your fifteen checkers to win.\n\nBecause hitting is illegal, race tactics dominate. Build prime walls of two checkers wherever you can to slow the CPU's runners, and advance your rear pieces early so they don't get stranded. The CPU picks legal moves at random, so disciplined pip management reliably outpaces it. Score is your pip lead at the end of the game; a winning differential of +30 or better is excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal, hint: (state: RaceState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-nardi-russian-race-primary"]', pulses: 3 } : null),
  component: RaceGame,
};
