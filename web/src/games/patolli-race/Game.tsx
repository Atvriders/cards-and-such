import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PatolliState, PatolliSettings, PatolliAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function PatolliGame({ state, dispatch, onGameOver }: GameProps<PatolliState, PatolliSettings>): JSX.Element {
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
      <div className="patolli-wrap">
        <h2 className={`patolli-banner ${won ? "patolli-win" : "patolli-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="patolli-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="patolli-wrap">
      <div className="patolli-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="patolli-meta">
        <span className="patolli-info">Track: {TRACK_LEN}</span>
        <span className="patolli-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="patolli-info">Single die</span>}
        {MUST_ROLL_6 && <span className="patolli-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="patolli-info patolli-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="patolli-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="patolli-die">{d}</div>
        )) : <div className="patolli-die patolli-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="patolli-btn patolli-btn-roll" onClick={() => dispatch({ type: "roll" } as PatolliAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="patolli-btn patolli-btn-end" onClick={() => dispatch({ type: "endTurn" } as PatolliAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="patolli-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="patolli-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`patolli-cell ${sp ? "patolli-special-" + sp.type : ""}${i === 0 ? " patolli-start" : ""}${i === TRACK_LEN ? " patolli-home" : ""}`}>
              <span className="patolli-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="patolli-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="patolli-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="patolli-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="patolli-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="patolli-sptag">★</span>}
              <div className="patolli-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="patolli-tok patolli-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="patolli-tok patolli-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="patolli-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="patolli-controls">
          <div className="patolli-label">Pick a pawn to move:</div>
          <div className="patolli-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="patolli-pawncard">
                  <span className="patolli-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="patolli-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as PatolliAction)}
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
