import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ScarletHeroesQuestState, ScarletHeroesQuestAction, ScarletHeroesQuestSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScarletHeroesQuestGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const scarletHeroesQuestPlugin: GamePlugin<ScarletHeroesQuestState, ScarletHeroesQuestAction, typeof settings> = {
  id: "scarlet-heroes-quest",
  title: "Scarlet Heroes: Quest",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; old-school single-PC scaled adventure.",
  howToPlay: "Scarlet Heroes: Quest is a solo journaling homage to Kevin Crawford's Scarlet Heroes, an old-school RPG ruleset where a single hero scales encounters meant for whole parties. The original system reframes hit dice, damage, and morale around the lone protagonist.\n\nAcross ten quest entries you pick how a single delver responds to dungeon, debt, drink, and the long road home. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThis solo digital homage replaces the dice-and-table mechanic with prompt-and-roll while preserving the swords-and-sorcery tone of being one person against a world that did not expect resistance.\n\nWrite each entry as the hero would write it: terse, slightly bragging, and lonely beneath the bragging.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScarletHeroesQuestSettings),
  reducer, isTerminal, hint: (state: ScarletHeroesQuestState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-scarlet-heroes-quest-primary"]', pulses: 3 } : null), component: ScarletHeroesQuestGame,
};
