import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SorryClState, SorryClSettings, SorryClAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function SorryClGame({ state, dispatch, onGameOver }: GameProps<SorryClState, SorryClSettings>): JSX.Element {
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
      <div className="sorrycl-wrap">
        <h2 className={`sorrycl-banner ${won ? "sorrycl-win" : "sorrycl-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="sorrycl-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="sorrycl-wrap">
      <div className="sorrycl-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="sorrycl-meta">
        <span className="sorrycl-info">Track: {TRACK_LEN}</span>
        <span className="sorrycl-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="sorrycl-info">Single die</span>}
        {MUST_ROLL_6 && <span className="sorrycl-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="sorrycl-info sorrycl-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="sorrycl-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="sorrycl-die">{d}</div>
        )) : <div className="sorrycl-die sorrycl-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="sorrycl-btn sorrycl-btn-roll" onClick={() => dispatch({ type: "roll" } as SorryClAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="sorrycl-btn sorrycl-btn-end" onClick={() => dispatch({ type: "endTurn" } as SorryClAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="sorrycl-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="sorrycl-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`sorrycl-cell ${sp ? "sorrycl-special-" + sp.type : ""}${i === 0 ? " sorrycl-start" : ""}${i === TRACK_LEN ? " sorrycl-home" : ""}`}>
              <span className="sorrycl-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="sorrycl-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="sorrycl-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="sorrycl-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="sorrycl-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="sorrycl-sptag">★</span>}
              <div className="sorrycl-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="sorrycl-tok sorrycl-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="sorrycl-tok sorrycl-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="sorrycl-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="sorrycl-controls">
          <div className="sorrycl-label">Pick a pawn to move:</div>
          <div className="sorrycl-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="sorrycl-pawncard">
                  <span className="sorrycl-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="sorrycl-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as SorryClAction)}
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
