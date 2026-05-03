import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { nationalFlagsMemoryState, nationalFlagsMemoryAction, nationalFlagsMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { nationalFlagsMemoryGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nationalFlagsMemoryPlugin: GamePlugin<nationalFlagsMemoryState, nationalFlagsMemoryAction, typeof settings> = {
  id: "national-flags-memory",
  title: "National Flags Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match country flags across the world — memory geography variant.",
  howToPlay: "National Flags Memory is a country-flag matching game where each round presents a flag description and asks you to identify the matching country from four options. Fifteen rounds total.\n\nThe pool of country-flag pairs includes France (Blue, white, red vertical bands), Japan (Red disk on white), Brazil (Green field with yellow diamond), Italy (Green, white, red vertical bands), United States (Stars and stripes red and white), Canada (Red maple leaf on white center), Germany (Black, red, gold horizontal bands), Spain (Red, yellow, red horizontal with crest), and several more international flags.\n\nEach correct answer scores ten points; max 150. Submit locks your choice; Next advances. There's no timer — read each description, visualise the flag, and pick. Strong geographers score 130+; flag enthusiasts hit perfect 150.\n\nThe original variant uses physical photo-realistic flag tiles; this digital adaptation preserves the description-to-country-name matching while rotating through a curated pool of well-known flags. Use it as a low-pressure geography drill or a calm moment between bigger games.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as nationalFlagsMemorySettings),
  reducer,
  isTerminal,
  
  hint: (state: nationalFlagsMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-national-flags-memory-answer-0"]', pulses: 3 } : null,component: nationalFlagsMemoryGame,
};
