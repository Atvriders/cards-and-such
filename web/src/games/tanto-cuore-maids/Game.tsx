import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { TantoCuoreMaidsState, TantoCuoreMaidsAction, TantoCuoreMaidsSettings } from "./state.js";
import { TantoCuoreMaids_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function TantoCuoreMaidsGame({ state, dispatch, onGameOver }: GameProps<TantoCuoreMaidsState, TantoCuoreMaidsSettings>): JSX.Element {
  return (
    <CoopView
      prefix="tcm"
      cfg={TantoCuoreMaids_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as TantoCuoreMaidsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, TantoCuoreMaids_CFG)}
      intro={FLAVOR}
    />
  );
}
