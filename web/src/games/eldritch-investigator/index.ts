import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EldritchInvestigatorState, EldritchInvestigatorAction, EldritchInvestigatorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EldritchInvestigatorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eldritchInvestigatorPlugin: GamePlugin<EldritchInvestigatorState, EldritchInvestigatorAction, typeof settings> = {
  id: "eldritch-investigator",
  title: "Eldritch Investigator",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Worldwide Lovecraftian variant — investigators on six continents.",
  howToPlay: "Eldritch Investigator is a worldwide Lovecraftian distillation. You play an investigator with an AI partner crossing six continents. Combined dice across ten rounds represent travel, encounter resolution, and mythos exposure. Hit 75 to seal the Ancient One's gate and claim the Investigator Bonus.\n\nPress Play Round to investigate. Then press Next Round, or Finish on round 10.\n\nIn the box, encounter cards on each continent paint a wide world; this distillation abstracts the globe-trotting into shared rolls. Your AI partner crosses oceans to rendezvous. The Bonus rewards a fully sealed game state. Antarctic ruins, jungle temples, arctic ice — every continent matters. Roll the dice. Save the world.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EldritchInvestigatorSettings),
  reducer, isTerminal, component: EldritchInvestigatorGame,
};
