import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MarvelChampionsHeroState, MarvelChampionsHeroAction, MarvelChampionsHeroSettings } from "./state.js";
import { MarvelChampionsHero_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MarvelChampionsHeroGame({ state, dispatch, onGameOver }: GameProps<MarvelChampionsHeroState, MarvelChampionsHeroSettings>): JSX.Element {
  return (
    <CoopView
      prefix="mvlchpHro"
      cfg={MarvelChampionsHero_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MarvelChampionsHeroAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MarvelChampionsHero_CFG)}
      intro={FLAVOR}
    />
  );
}
