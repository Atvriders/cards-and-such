import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CodenamesPicturesState, CodenamesPicturesAction, CodenamesPicturesSettings } from "./state.js";
import { CodenamesPictures_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
import { CodenamesPicturesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const codenamesPicturesPlugin: GamePlugin<CodenamesPicturesState, CodenamesPicturesAction, typeof settings> = {
  id: "codenames-pictures",
  title: "Codenames: Pictures",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify your team's pictures by clue.",
  howToPlay: "Codenames: Pictures adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CodenamesPicturesSettings),
  reducer,
  isTerminal,
  hint: (state: CodenamesPicturesState): HintTarget | null => {
    const sel = deductionHintSelector(state, CodenamesPictures_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CodenamesPicturesGame,
};

export default codenamesPicturesPlugin;
