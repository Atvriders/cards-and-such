import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AloneAmongStarsCardState, AloneAmongStarsCardAction, AloneAmongStarsCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AloneAmongStarsCardGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aloneAmongStarsCardPlugin: GamePlugin<AloneAmongStarsCardState, AloneAmongStarsCardAction, typeof settings> = {
  id: "alone-among-stars-card",
  title: "Alone Among the Stars: Card Log",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo card-driven world describer; ultra-minimal.",
  howToPlay: "Alone Among the Stars: Card Log is a solo journaling homage to Takuma Okada's Alone Among the Stars, an ultra-minimal solitaire game where each playing-card draw describes a strange new world for an exhausted explorer to visit.\n\nAcross ten card draws you record alien worlds — their colors, their inhabitants, their absences. Each prompt offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. Choose what you describe — the sky, the sea, the silence, or the song that you bring back to the lonely ship.\n\nThe original game is a single sheet, a deck, and a quiet evening. This solo digital homage preserves the prompt-and-record ritual while pre-curating ten worlds rather than the deck's full fifty-two.\n\nDescribe softly. Many of these worlds will never be visited again.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AloneAmongStarsCardSettings),
  reducer, isTerminal, component: AloneAmongStarsCardGame,
};
