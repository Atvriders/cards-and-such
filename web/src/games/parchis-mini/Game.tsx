import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParchisMiniState, ParchisMiniSettings, ParchisMiniAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function ParchisMiniGame({ state, dispatch, onGameOver }: GameProps<ParchisMiniState, ParchisMiniSettings>): JSX.Element {
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
      <div className="parchismini-wrap">
        <h2 className={`parchismini-banner ${won ? "parchismini-win" : "parchismini-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="parchismini-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="parchismini-wrap">
      <div className="parchismini-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="parchismini-meta">
        <span className="parchismini-info">Track: {TRACK_LEN}</span>
        <span className="parchismini-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="parchismini-info">Single die</span>}
        {MUST_ROLL_6 && <span className="parchismini-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="parchismini-info parchismini-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="parchismini-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="parchismini-die">{d}</div>
        )) : <div className="parchismini-die parchismini-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="parchismini-btn parchismini-btn-roll" onClick={() => dispatch({ type: "roll" } as ParchisMiniAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="parchismini-btn parchismini-btn-end" onClick={() => dispatch({ type: "endTurn" } as ParchisMiniAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="parchismini-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="parchismini-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`parchismini-cell ${sp ? "parchismini-special-" + sp.type : ""}${i === 0 ? " parchismini-start" : ""}${i === TRACK_LEN ? " parchismini-home" : ""}`}>
              <span className="parchismini-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="parchismini-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="parchismini-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="parchismini-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="parchismini-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="parchismini-sptag">★</span>}
              <div className="parchismini-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="parchismini-tok parchismini-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="parchismini-tok parchismini-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="parchismini-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="parchismini-controls">
          <div className="parchismini-label">Pick a pawn to move:</div>
          <div className="parchismini-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="parchismini-pawncard">
                  <span className="parchismini-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      title={`Move ${pips} spaces`}
                      className="parchismini-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as ParchisMiniAction)}
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
