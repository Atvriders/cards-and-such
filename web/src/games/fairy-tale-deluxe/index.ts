import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FairyTaleDeluxeState, FairyTaleDeluxeAction, FairyTaleDeluxeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FairyTaleDeluxeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fairyTaleDeluxePlugin: GamePlugin<FairyTaleDeluxeState, FairyTaleDeluxeAction, typeof settings> = {
  id: "fairy-tale-deluxe",
  title: "Fairy Tale: Deluxe",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese card draft with conditional freezing; deluxe variant.",
  howToPlay: "Fairy Tale: Deluxe is a Japanese card-draft variant of the original Fairy Tale, with deluxe condition-freezing across eight rounds. Suits are fairy archetypes — Princess, Witch, Knight, and Dragon.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a fairy tale tableau.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per archetype with 3+ cards (story arc complete).\n- +15 additional per archetype with 5+ cards.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Deluxe rewards story arcs — three Princess cards is +10. The greedy CPU takes the rank-9, leaving mid-tier for your arc. Princess-3 secures your story over Dragon-9 splash. Aim for 60-100 points. Fairy Tale: Deluxe captures the original's elegant draft-and-freeze mechanism in a tight eight-round flow. Tell your tale.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FairyTaleDeluxeSettings),
  reducer,
  isTerminal,
  component: FairyTaleDeluxeGame,
};
