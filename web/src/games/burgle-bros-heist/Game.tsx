import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { BurgleBrosHeistState, BurgleBrosHeistAction, BurgleBrosHeistSettings } from "./state.js";
import { BurgleBrosHeist_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function BurgleBrosHeistGame({ state, dispatch, onGameOver }: GameProps<BurgleBrosHeistState, BurgleBrosHeistSettings>): JSX.Element {
  return (
    <CoopView
      prefix="brgBrHeis"
      cfg={BurgleBrosHeist_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as BurgleBrosHeistAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, BurgleBrosHeist_CFG)}
      intro={FLAVOR}
    />
  );
}
