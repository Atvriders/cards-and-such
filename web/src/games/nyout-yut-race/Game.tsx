import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NyoutState, NyoutSettings, NyoutAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function NyoutGame({ state, dispatch, onGameOver }: GameProps<NyoutState, NyoutSettings>): JSX.Element {
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
      <div className="nyout-wrap">
        <h2 className={`nyout-banner ${won ? "nyout-win" : "nyout-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="nyout-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="nyout-wrap">
      <div className="nyout-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="nyout-meta">
        <span className="nyout-info">Track: {TRACK_LEN}</span>
        <span className="nyout-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="nyout-info">Single die</span>}
        {MUST_ROLL_6 && <span className="nyout-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="nyout-info nyout-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="nyout-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="nyout-die">{d}</div>
        )) : <div className="nyout-die nyout-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="nyout-btn nyout-btn-roll" onClick={() => dispatch({ type: "roll" } as NyoutAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="nyout-btn nyout-btn-end" onClick={() => dispatch({ type: "endTurn" } as NyoutAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="nyout-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="nyout-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`nyout-cell ${sp ? "nyout-special-" + sp.type : ""}${i === 0 ? " nyout-start" : ""}${i === TRACK_LEN ? " nyout-home" : ""}`}>
              <span className="nyout-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="nyout-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="nyout-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="nyout-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="nyout-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="nyout-sptag">★</span>}
              <div className="nyout-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="nyout-tok nyout-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="nyout-tok nyout-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="nyout-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="nyout-controls">
          <div className="nyout-label">Pick a pawn to move:</div>
          <div className="nyout-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="nyout-pawncard">
                  <span className="nyout-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="nyout-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as NyoutAction)}
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
