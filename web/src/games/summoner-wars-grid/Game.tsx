import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SummonerWarsGridState, SummonerWarsGridAction, SummonerWarsGridSettings } from "./state.js";
import { SummonerWarsGrid_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SummonerWarsGridGame({ state, dispatch, onGameOver }: GameProps<SummonerWarsGridState, SummonerWarsGridSettings>): JSX.Element {
  return (
    <CoopView
      prefix="swg"
      cfg={SummonerWarsGrid_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SummonerWarsGridAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SummonerWarsGrid_CFG)}
      intro={FLAVOR}
    />
  );
}
