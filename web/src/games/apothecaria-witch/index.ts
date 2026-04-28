import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApothecariaWitchState, ApothecariaWitchAction, ApothecariaWitchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApothecariaWitchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const apothecariaWitchPlugin: GamePlugin<ApothecariaWitchState, ApothecariaWitchAction, typeof settings> = {
  id: "apothecaria-witch",
  title: "Apothecaria: Village Witch",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — village witch gathers herbs through the seasons.",
  howToPlay: "Apothecaria: Village Witch is a solo journaling homage to Andrew Boyd's Apothecaria, where a village healer/witch tends to seasonal needs by foraging herbs, brewing potions, and helping villagers through the year. The original is a gentle, slow-paced game with strong cottagecore vibes.\n\nAcross ten entries you make seasonal choices about gathering, brewing, sleeping, and meeting visitors. Each prompt offers four choices A-D; each assigns a base reward plus 0-20 of variance via the seeded oracle. Generous choices generally reward differently from prudent ones.\n\nThere is no failure state — only a year in the life of a kind, useful witch. The score is your apothecary's volume of herbs, potions, and goodwill at year's end.\n\nImagine the wood-fire in your hearth, the murmurs of the village, the cat at your feet. The kettle is always warming. Welcome, friend.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApothecariaWitchSettings),
  reducer, isTerminal, component: ApothecariaWitchGame,
};
