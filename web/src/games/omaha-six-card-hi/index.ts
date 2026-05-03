import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-omaha-six-card-hi-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-omaha-six-card-hi-secondary"]', pulses: 3 };
  return null;
};

export const omahaSixCardHiPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "omaha-six-card-hi",
  title: "Six-Card Omaha",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Omaha with six hole cards.",
  howToPlay: "Six-Card Omaha is an Omaha variant where each player is dealt six hole cards instead of the traditional four, with the same exact-two-from-hole rule for showdown. Six holes generate fifteen possible two-card combinations rather than six, making strong starting hands much more common.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal six holes plus a five-card community board. The engine evaluates the standard Omaha rule: best two of six holes plus three of five board cards. A stronger five-card hand than the dealer pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Six-Card Omaha is increasingly popular in high-stakes cash games and is sometimes called Big O. The deeper draws and steeper post-flop equities reward tight-aggressive play with strong rundown hands. Watch for double-suited holdings — they win big.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer, isTerminal, hint: hint, component: CasGame,
};
