import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MarvelChampionsCoopState, MarvelChampionsCoopAction, MarvelChampionsCoopSettings } from "./state.js";
import { MarvelChampionsCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MarvelChampionsCoopGame({ state, dispatch, onGameOver }: GameProps<MarvelChampionsCoopState, MarvelChampionsCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="mvlchpCop"
      cfg={MarvelChampionsCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MarvelChampionsCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MarvelChampionsCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
