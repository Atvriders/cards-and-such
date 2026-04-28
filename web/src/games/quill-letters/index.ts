import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuillLettersState, QuillLettersAction, QuillLettersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuillLettersGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quillLettersPlugin: GamePlugin<QuillLettersState, QuillLettersAction, typeof settings> = {
  id: "quill-letters",
  title: "Quill: Letters",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — write letters as fantasy characters and score for grace.",
  howToPlay: "Quill: Letters is a solo journaling homage to Scott Malthouse's Quill, a solo letter-writing RPG where the player composes letters in-character to score on adjectives like Penmanship, Grace, and Heart.\n\nAcross ten entries you take on a different correspondence each round. Each prompt offers four choices A-D — for instance, what tone to take, how to open, what compliment to weave in. Each choice assigns a base reward plus 0-20 of variance via the seeded oracle.\n\nThe original Quill uses a specific rolling-and-scoring system per quality. This homage compresses to a single round score that aggregates all the letter's qualities. Some letters score richly, others quietly — but every letter is sealed, sent, and counted.\n\nImagine the dip of quill into ink, the rasp of paper, the candle burning low. You are a courtier, a scholar, or a lover. The wax is warming. Begin.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuillLettersSettings),
  reducer, isTerminal, component: QuillLettersGame,
};
