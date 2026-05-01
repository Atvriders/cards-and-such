import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrustrationState, FrustrationSettings, FrustrationAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function FrustrationGame({ state, dispatch, onGameOver }: GameProps<FrustrationState, FrustrationSettings>): JSX.Element {
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
      <div className="frustration-wrap">
        <h2 className={`frustration-banner ${won ? "frustration-win" : "frustration-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="frustration-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="frustration-wrap">
      <div className="frustration-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="frustration-meta">
        <span className="frustration-info">Track: {TRACK_LEN}</span>
        <span className="frustration-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="frustration-info">Single die</span>}
        {MUST_ROLL_6 && <span className="frustration-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="frustration-info frustration-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="frustration-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="frustration-die">{d}</div>
        )) : <div className="frustration-die frustration-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="frustration-btn frustration-btn-roll" onClick={() => dispatch({ type: "roll" } as FrustrationAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="frustration-btn frustration-btn-end" onClick={() => dispatch({ type: "endTurn" } as FrustrationAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="frustration-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="frustration-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`frustration-cell ${sp ? "frustration-special-" + sp.type : ""}${i === 0 ? " frustration-start" : ""}${i === TRACK_LEN ? " frustration-home" : ""}`}>
              <span className="frustration-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="frustration-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="frustration-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="frustration-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="frustration-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="frustration-sptag">★</span>}
              <div className="frustration-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="frustration-tok frustration-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="frustration-tok frustration-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="frustration-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="frustration-controls">
          <div className="frustration-label">Pick a pawn to move:</div>
          <div className="frustration-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="frustration-pawncard">
                  <span className="frustration-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="frustration-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as FrustrationAction)}
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
