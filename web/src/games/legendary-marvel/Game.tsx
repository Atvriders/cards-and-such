import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { LegendaryMarvelState, LegendaryMarvelAction, LegendaryMarvelSettings } from "./state.js";
import { LegendaryMarvel_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LegendaryMarvelGame({ state, dispatch, onGameOver }: GameProps<LegendaryMarvelState, LegendaryMarvelSettings>): JSX.Element {
  return (
    <CoopView
      prefix="lgm"
      cfg={LegendaryMarvel_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as LegendaryMarvelAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, LegendaryMarvel_CFG)}
      intro={FLAVOR}
    />
  );
}
