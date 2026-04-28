import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WanderhomeJourneyState, WanderhomeJourneyAction, WanderhomeJourneySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WanderhomeJourneyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const wanderhomeJourneyPlugin: GamePlugin<WanderhomeJourneyState, WanderhomeJourneyAction, typeof settings> = {
  id: "wanderhome-journey",
  title: "Wanderhome: Journey",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — pastoral animal-folk wandering through soft fantasy.",
  howToPlay: "Wanderhome: Journey is a solo journaling homage to Jay Dragon's Wanderhome, the pastoral PBTA game about animal-folk traveling through a soft fantasy world. The original is famous for its kind tone, evocative tables, and zero violence.\n\nAcross ten entries you make choices about whom to meet, what to share, where to camp. Each prompt offers four choices A-D; each assigns a base reward plus 0-20 of variance via the seeded oracle. Compassionate choices reward differently from quiet ones, but no path is wrong.\n\nWanderhome's full ruleset includes seasonal natures, traits, and a deep travelling-companion system. This homage compresses to choice-and-consequence while preserving the gentle, wandering rhythm.\n\nImagine the wind in your fur, the smell of late summer, the warmth of a kindled fire. There are no monsters. There are no enemies. There is only the road — and the kind animal-folk who walk it with you.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WanderhomeJourneySettings),
  reducer, isTerminal, component: WanderhomeJourneyGame,
};
