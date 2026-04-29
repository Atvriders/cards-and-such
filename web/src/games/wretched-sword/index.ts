import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WretchedSwordState, WretchedSwordAction, WretchedSwordSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WretchedSwordGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wretchedSwordPlugin: GamePlugin<WretchedSwordState, WretchedSwordAction, typeof settings> = {
  id: "wretched-sword",
  title: "The Wretched Sword",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; cursed blade through history.",
  howToPlay: "The Wretched Sword is a solo journaling homage to the Wretched & Alone family, here following Joe Caron's The Sword — a cursed blade that wanders through history, owned briefly by mortals before consuming them or being lost again.\n\nAcross ten owner entries you record fragments of the blade's chronicle — coronations, betrayals, exiles, sea-burials, and the long centuries between. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. Choose what the blade does, sees, or refuses to do.\n\nThe original system uses a Jenga tower and 52 cards to drive narrative collapse. This solo digital homage replaces the tower with weighted choice-and-roll while preserving the cursed-object tone of being many things to many wielders, and ultimately the death of all of them.\n\nThe sword does not love you. The sword remembers.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WretchedSwordSettings),
  reducer, isTerminal, component: WretchedSwordGame,
};
