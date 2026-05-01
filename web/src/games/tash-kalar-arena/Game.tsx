import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { TashKalarArenaState, TashKalarArenaAction, TashKalarArenaSettings } from "./state.js";
import { TashKalarArena_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function TashKalarArenaGame({ state, dispatch, onGameOver }: GameProps<TashKalarArenaState, TashKalarArenaSettings>): JSX.Element {
  return (
    <CoopView
      prefix="tka"
      cfg={TashKalarArena_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as TashKalarArenaAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, TashKalarArena_CFG)}
      intro={FLAVOR}
    />
  );
}
