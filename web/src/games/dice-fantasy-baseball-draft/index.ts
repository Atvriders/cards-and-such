import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftAction, DiceFantasyBaseballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyBaseballDraftGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFantasyBaseballDraftPlugin: GamePlugin<DiceFantasyBaseballDraftState, DiceFantasyBaseballDraftAction, typeof settings> = {
  id: "dice-fantasy-baseball-draft",
  title: "Fantasy Baseball Draft",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Fantasy Baseball Draft: draft 8 picks; build the highest-rated roster.',
  howToPlay: 'Fantasy Baseball Draft is a real, dice-driven simulation. Fantasy Baseball Draft: draft 8 picks; build the highest-rated roster.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFantasyBaseballDraftSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFantasyBaseballDraftState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-fantasy-baseball-draft-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-fantasy-baseball-draft-next"]', pulses: 3 };
    return null;
  },
  component: DiceFantasyBaseballDraftGame,
};
