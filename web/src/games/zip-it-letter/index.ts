import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { zipItLetterState, zipItLetterAction, zipItLetterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { zipItLetterGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zipItLetterPlugin: GamePlugin<zipItLetterState, zipItLetterAction, typeof settings> = {
  id: "zip-it-letter",
  title: "Zip It",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to zip a word-letter cube — letter-arrangement memory game.",
  howToPlay: "Zip It is a head-to-head word-arrangement memory game distilled to fifteen letter-cube rounds. Each round presents a partial word arrangement and asks you to identify which letter completes it.\n\nThe pool of letter-cube challenges includes word fragments like CA_, _OG, FR_, BA_, and other common 3-letter words missing one position. You pick the matching letter from four options; correct answers score ten points; max 150.\n\nClick a choice, press Submit to lock, then Next to advance. The original Zip It is a 2-player race to arrange letter cubes into a complete word grid; this distillation preserves the letter-arrangement focus while removing the head-to-head speed component. Solid spellers score 130+; word enthusiasts hit perfect 150.\n\nUse it as a quick spelling-recognition drill or as a calm warm-down between faster word games. Reading the partial fragment, visualising the missing letter, and picking — that's the rhythm of Zip It in solo form.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as zipItLetterSettings),
  reducer,
  isTerminal,
  
  hint: (state: zipItLetterState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-zip-it-letter-answer-0"]', pulses: 3 } : null,component: zipItLetterGame,
};
