import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PineapplePokerState, PineapplePokerAction, PineapplePokerSettings } from "./state.js";
import { isTerminal, bestFive, TOTAL_HANDS } from "./state.js";
import { PokerTable } from "../_shared/PokerTable.js";
import "./Game.css";

export function PineapplePokerGame({ state, dispatch, onGameOver }: GameProps<PineapplePokerState, PineapplePokerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const sb = parseInt(state.settings.smallBlind, 10);
  const dis = (a: PineapplePokerAction): void => dispatch(a);

  const playerBest = state.player.hole.length >= 2 && state.community.length >= 3
    ? bestFive([...state.player.hole, ...state.community]) : null;
  const cpuBest = state.showdownReveal && state.cpu.hole.length >= 2 && state.community.length >= 3
    ? bestFive([...state.cpu.hole, ...state.community]) : null;

  return (
    <div className="thmPineap">
    <PokerTable
      prefix="pineap-"
      state={state}
      totalHands={TOTAL_HANDS}
      smallBlind={sb}
      playerHandLabel={playerBest?.class}
      cpuHandLabel={cpuBest?.class}
      discardPrompt="Tap a hole card to discard (Pineapple rule)."
      onDeal={() => dis({ type: "deal" })}
      onFold={() => dis({ type: "fold" })}
      onCheck={() => dis({ type: "check" })}
      onCall={() => dis({ type: "call" })}
      onRaise={(amount) => dis({ type: "raise", amount })}
      onDiscard={(index) => dis({ type: "discard", index })}
    />
  </div>
  );
}
