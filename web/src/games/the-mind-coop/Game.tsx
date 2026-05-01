import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { TheMindCoopState, TheMindCoopAction, TheMindCoopSettings } from "./state.js";
import { TheMindCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function TheMindCoopGame({ state, dispatch, onGameOver }: GameProps<TheMindCoopState, TheMindCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="tmd"
      cfg={TheMindCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as TheMindCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, TheMindCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
