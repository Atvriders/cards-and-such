import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { welcomeAdventurelandState, welcomeAdventurelandAction, welcomeAdventurelandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { welcomeAdventurelandGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeAdventurelandPlugin: GamePlugin<welcomeAdventurelandState, welcomeAdventurelandAction, typeof settings> = {
  id: "welcome-adventureland",
  title: "Welcome to Adventureland",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fantasy Welcome To variant — flip dungeon-room cards and mark adventures.",
  howToPlay: "Welcome to Adventureland is a fantasy-themed riff on the Welcome To roll-and-write engine. Instead of suburban streets you populate three rows of dungeon rooms (Crypts, Cellars, and Halls), each with eleven slots (numbers 2-12).\n\nEach turn the deck flips a virtual card and you receive a number 1-6 plus an action choice. Press Roll to generate the next number, then click any unmarked cell in any row to write the number there. Cells can be filled in any order. Filling rooms scores 2 points each.\n\nCompleting any full row earns a +5 dungeon-completion bonus, and finishing all rows triggers an Adventurer's Triumph bonus of +10. Skipping a roll costs nothing but burns a turn — you only get twelve total.\n\nThe original Welcome To: Adventureland is part of the campaign-Welcome series with monsters and quests; this distillation captures the core flip-pick-and-write loop in a four-by-four grid layout. Thirty to forty-five points marks a tidy run; forty-five-plus is hero-class.\n\nKeep rooms balanced and the dungeon falls open before you.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as welcomeAdventurelandSettings),
  reducer,
  isTerminal, hint: (state: welcomeAdventurelandState): HintTarget | null => (state.phase === "rolling" ? { selector: '[data-testid="hint-target-welcome-adventureland-primary"]', pulses: 3 } : null),
  component: welcomeAdventurelandGame,
};
