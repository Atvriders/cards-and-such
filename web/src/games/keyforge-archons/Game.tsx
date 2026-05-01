import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { KeyforgeArchonsState, KeyforgeArchonsAction, KeyforgeArchonsSettings } from "./state.js";
import { KeyforgeArchons_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function KeyforgeArchonsGame({ state, dispatch, onGameOver }: GameProps<KeyforgeArchonsState, KeyforgeArchonsSettings>): JSX.Element {
  return (
    <CoopView
      prefix="kfa"
      cfg={KeyforgeArchons_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as KeyforgeArchonsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, KeyforgeArchons_CFG)}
      intro={FLAVOR}
    />
  );
}
