import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelChampionsHeroState, MarvelChampionsHeroAction, MarvelChampionsHeroSettings } from "./state.js";
import { MarvelChampionsHero_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { MarvelChampionsHeroGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const marvelChampionsHeroPlugin: GamePlugin<MarvelChampionsHeroState, MarvelChampionsHeroAction, typeof settings> = {
  id: "marvel-champions-hero",
  title: "Marvel Champions: Hero",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo hero focus deck-building variant.",
  howToPlay: "Marvel Champions: Hero is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarvelChampionsHeroSettings),
  reducer,
  isTerminal,
  hint: (state: MarvelChampionsHeroState): HintTarget | null => {
    const sel = coopHintSelector(state, MarvelChampionsHero_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MarvelChampionsHeroGame,
};

export default marvelChampionsHeroPlugin;
