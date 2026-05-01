import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OmahaHiLoState, OmahaHiLoAction, OmahaHiLoSettings } from "./state.js";
import { isTerminal, bestOmaha, bestOmahaLow, TOTAL_HANDS } from "./state.js";
import { PokerTable } from "../_shared/PokerTable.js";
import "./Game.css";

export function OmahaHiLoGame({ state, dispatch, onGameOver }: GameProps<OmahaHiLoState, OmahaHiLoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const sb = parseInt(state.settings.smallBlind, 10);
  const dis = (a: OmahaHiLoAction): void => dispatch(a);

  const ph = state.player.hole.length === 4 && state.community.length >= 3 ? bestOmaha(state.player.hole, state.community) : null;
  const pl = state.player.hole.length === 4 && state.community.length === 5 ? bestOmahaLow(state.player.hole, state.community) : null;
  const playerLabel = ph
    ? `${ph.class}${pl?.ok ? ` / low ${pl.ranks.map((r) => (r === 1 ? "A" : r)).join("-")}` : ""}`
    : undefined;
  const ch = state.showdownReveal && state.cpu.hole.length === 4 && state.community.length >= 3
    ? bestOmaha(state.cpu.hole, state.community) : null;
  const cl = state.showdownReveal && state.cpu.hole.length === 4 && state.community.length === 5
    ? bestOmahaLow(state.cpu.hole, state.community) : null;
  const cpuLabel = ch
    ? `${ch.class}${cl?.ok ? ` / low ${cl.ranks.map((r) => (r === 1 ? "A" : r)).join("-")}` : ""}`
    : undefined;

  return (
    <div className="thmOmaHiLo">
    <PokerTable
      prefix="omaha-hilo-"
      state={state}
      totalHands={TOTAL_HANDS}
      smallBlind={sb}
      playerHandLabel={playerLabel}
      cpuHandLabel={cpuLabel}
      onDeal={() => dis({ type: "deal" })}
      onFold={() => dis({ type: "fold" })}
      onCheck={() => dis({ type: "check" })}
      onCall={() => dis({ type: "call" })}
      onRaise={(amount) => dis({ type: "raise", amount })}
    />
  </div>
  );
}
