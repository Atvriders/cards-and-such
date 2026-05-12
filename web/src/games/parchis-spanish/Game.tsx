import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParchisState, ParchisSettings, ParchisAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function ParchisGame({ state, dispatch, onGameOver }: GameProps<ParchisState, ParchisSettings>): JSX.Element {
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
      <div className="parchis-wrap">
        <h2 className={`parchis-banner ${won ? "parchis-win" : "parchis-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="parchis-score pulse">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="parchis-wrap">
      <div className="parchis-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="parchis-meta">
        <span className="parchis-info">Track: {TRACK_LEN}</span>
        <span className="parchis-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="parchis-info">Single die</span>}
        {MUST_ROLL_6 && <span className="parchis-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="parchis-info parchis-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="parchis-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="parchis-die">{d}</div>
        )) : <div className="parchis-die parchis-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="parchis-btn parchis-btn-roll" onClick={() => dispatch({ type: "roll" } as ParchisAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="parchis-btn parchis-btn-end" onClick={() => dispatch({ type: "endTurn" } as ParchisAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="parchis-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="parchis-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`parchis-cell ${sp ? "parchis-special-" + sp.type : ""}${i === 0 ? " parchis-start" : ""}${i === TRACK_LEN ? " parchis-home" : ""}`}>
              <span className="parchis-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="parchis-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="parchis-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="parchis-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="parchis-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="parchis-sptag">★</span>}
              <div className="parchis-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="parchis-tok parchis-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="parchis-tok parchis-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="parchis-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="parchis-controls">
          <div className="parchis-label">Pick a pawn to move:</div>
          <div className="parchis-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="parchis-pawncard">
                  <span className="parchis-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="parchis-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as ParchisAction)}
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
