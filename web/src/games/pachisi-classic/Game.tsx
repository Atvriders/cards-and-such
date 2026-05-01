import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PachisiState, PachisiSettings, PachisiAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function PachisiGame({ state, dispatch, onGameOver }: GameProps<PachisiState, PachisiSettings>): JSX.Element {
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
      <div className="pachisi-wrap">
        <h2 className={`pachisi-banner ${won ? "pachisi-win" : "pachisi-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="pachisi-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="pachisi-wrap">
      <div className="pachisi-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="pachisi-meta">
        <span className="pachisi-info">Track: {TRACK_LEN}</span>
        <span className="pachisi-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="pachisi-info">Single die</span>}
        {MUST_ROLL_6 && <span className="pachisi-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="pachisi-info pachisi-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="pachisi-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="pachisi-die">{d}</div>
        )) : <div className="pachisi-die pachisi-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="pachisi-btn pachisi-btn-roll" onClick={() => dispatch({ type: "roll" } as PachisiAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="pachisi-btn pachisi-btn-end" onClick={() => dispatch({ type: "endTurn" } as PachisiAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="pachisi-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="pachisi-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`pachisi-cell ${sp ? "pachisi-special-" + sp.type : ""}${i === 0 ? " pachisi-start" : ""}${i === TRACK_LEN ? " pachisi-home" : ""}`}>
              <span className="pachisi-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="pachisi-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="pachisi-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="pachisi-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="pachisi-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="pachisi-sptag">★</span>}
              <div className="pachisi-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="pachisi-tok pachisi-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="pachisi-tok pachisi-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="pachisi-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="pachisi-controls">
          <div className="pachisi-label">Pick a pawn to move:</div>
          <div className="pachisi-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="pachisi-pawncard">
                  <span className="pachisi-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="pachisi-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as PachisiAction)}
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
