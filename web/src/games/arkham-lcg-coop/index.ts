import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArkhamLcgCoopState, ArkhamLcgCoopAction, ArkhamLcgCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArkhamLcgCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const arkhamLcgCoopPlugin: GamePlugin<ArkhamLcgCoopState, ArkhamLcgCoopAction, typeof settings> = {
  id: "arkham-lcg-coop",
  title: "Arkham LCG Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative Lovecraftian investigation — pool your sanity against the dark.",
  howToPlay: "Arkham LCG Co-op tributes the long-running Arkham Horror Living Card Game by Fantasy Flight Games. You and an AI investigator face down ten rounds of horror together, each round rolling dice that represent willpower checks, combat tests, and lore breakthroughs. Reach a team total of 70 to defeat the encounter and earn a 50-point sanity bonus.\n\nEach round, press Play Round. Both dice show their values and the sum joins your shared team score. Press Next Round to continue, or Finish on round 10. Lower scores narratively mean the investigation went poorly; high scores mean the mythos retreats — for now.\n\nThe full Arkham LCG features deck-building, character traits, scenarios, agendas, and chaos bag mechanics. This dice-only homage skips the deckbuilding entirely, keeping the cooperative pulse: pool every action, share every consequence. Survive together or fail together. Either way, the doom track keeps ticking — but only for ten rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArkhamLcgCoopSettings),
  reducer, isTerminal, component: ArkhamLcgCoopGame,
};
