import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HpDefenceDarkArtsState, HpDefenceDarkArtsAction, HpDefenceDarkArtsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HpDefenceDarkArtsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hpDefenceDarkArtsPlugin: GamePlugin<HpDefenceDarkArtsState, HpDefenceDarkArtsAction, typeof settings> = {
  id: "hp-defence-dark-arts",
  title: "HP: Defence Against Dark Arts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hogwarts Battle competitive duel variant — defence spell vs offence.",
  howToPlay: "HP: Defence Against the Dark Arts adapts the Hogwarts Battle competitive duel for cooperative spellcasting. You command a defending wizard while your AI partner casts disarming charms in tandem. Across ten rounds, both dice represent your spell success — one for shield, one for stunning hex. Combine to reach 60 points and pass the practical exam.\n\nPress Play Round to cast spells together. Then press Next Round, or Finish on round 10. Reaching the target earns a 50-point bonus signed by Professor Lupin himself.\n\nIn the box, this variant is a duel; here it is a study session. You learn to time spells, to support your partner's wand work, and to keep the dark arts at bay. Better roll high — a dementor never sleeps.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HpDefenceDarkArtsSettings),
  reducer, isTerminal, component: HpDefenceDarkArtsGame,
};
