import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AggravationState, AggravationSettings, AggravationAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function AggravationGame({ state, dispatch, onGameOver }: GameProps<AggravationState, AggravationSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const isPTurn = state.turn === "P";
  const moves = state.phase === "moving" && isPTurn ? legalMovesForP(state) : [];
  const movesByPawn = new Map<number, number[]>();
  for (const m of moves) {
    if (!movesByPawn.has(m.pawnIdx)) movesByPawn.set(m.pawnIdx, []);
    movesByPawn.get(m.pawnIdx)!.push(m.pips);
  }

  if (state.phase === "done") {
    const won = state.winner === "P";
    return (
      <div className="aggravation-wrap">
        <h2 className={`aggravation-banner ${won ? "aggravation-win" : "aggravation-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="aggravation-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="aggravation-wrap">
      <div className="aggravation-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="aggravation-meta">
        <span className="aggravation-info">Track: {TRACK_LEN}</span>
        <span className="aggravation-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="aggravation-info">Single die</span>}
        {MUST_ROLL_6 && <span className="aggravation-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="aggravation-info aggravation-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="aggravation-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="aggravation-die">{d}</div>
        )) : <div className="aggravation-die aggravation-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="aggravation-btn aggravation-btn-roll" onClick={() => dispatch({ type: "roll" } as AggravationAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="aggravation-btn aggravation-btn-end" onClick={() => dispatch({ type: "endTurn" } as AggravationAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="aggravation-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="aggravation-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`aggravation-cell ${sp ? "aggravation-special-" + sp.type : ""}${i === 0 ? " aggravation-start" : ""}${i === TRACK_LEN ? " aggravation-home" : ""}`}>
              <span className="aggravation-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="aggravation-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="aggravation-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="aggravation-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="aggravation-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="aggravation-sptag">★</span>}
              <div className="aggravation-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="aggravation-tok aggravation-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="aggravation-tok aggravation-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="aggravation-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="aggravation-controls">
          <div className="aggravation-label">Pick a pawn to move:</div>
          <div className="aggravation-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="aggravation-pawncard">
                  <span className="aggravation-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="aggravation-movebtn"
                      title="Move pawn by this amount"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as AggravationAction)}
                    >
                      +{pips}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
