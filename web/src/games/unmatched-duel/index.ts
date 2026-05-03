import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { unmatchedDuelState, unmatchedDuelAction, unmatchedDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { unmatchedDuelGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const unmatchedDuelPlugin: GamePlugin<unmatchedDuelState, unmatchedDuelAction, typeof settings> = {
  id: "unmatched-duel",
  title: "Unmatched",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric hero duel — fifteen character-recognition rounds.",
  howToPlay: "Unmatched is an asymmetric hero duel card game distilled to fifteen character-recognition rounds. Each round presents a hero description and asks you to identify the matching character from four options.\n\nThe pool of hero descriptions includes King Arthur (Excalibur, knight, leader), Robin Hood (Bow, forest, outlaw), Medusa (Snakes, gaze, monster), Sherlock Holmes (Pipe, deduction, detective), Dracula (Cape, fangs, vampire), and other characters from myth, literature, and film. Each correct answer scores ten points; max 150.\n\nClick a hero, press Submit to lock, then Next to advance. The original Unmatched is a 2-4 player asymmetric tactical card game; this distillation preserves the character-recognition aspect without the tactical map play. Pop-culture fans score 130+; character experts hit perfect 150.\n\nUse it as a quick character-archetype warmup or a calm warm-down between Unmatched matches. Read the description, picture the legend, and pick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unmatchedDuelSettings),
  reducer,
  isTerminal,
  
  hint: (state: unmatchedDuelState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-unmatched-duel-answer-0"]', pulses: 3 } : null,component: unmatchedDuelGame,
};
