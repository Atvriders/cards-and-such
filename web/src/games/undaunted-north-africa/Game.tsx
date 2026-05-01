import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { UndauntedNorthAfricaState, UndauntedNorthAfricaAction, UndauntedNorthAfricaSettings } from "./state.js";
import { UndauntedNorthAfrica_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function UndauntedNorthAfricaGame({ state, dispatch, onGameOver }: GameProps<UndauntedNorthAfricaState, UndauntedNorthAfricaSettings>): JSX.Element {
  return (
    <CoopView
      prefix="udna"
      cfg={UndauntedNorthAfrica_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as UndauntedNorthAfricaAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, UndauntedNorthAfrica_CFG)}
      intro={FLAVOR}
    />
  );
}
