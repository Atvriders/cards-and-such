import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BridgeContractState, BridgeContractAction, BridgeContractSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BridgeContractGame({ state, dispatch, onGameOver }: GameProps<BridgeContractState, BridgeContractSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BridgeContractAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bridgec"
      title="Contract Bridge"
    />
  );
}
