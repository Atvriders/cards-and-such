import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PatolliMiniState, PatolliMiniSettings, PatolliMiniAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function PatolliMiniGame({ state, dispatch, onGameOver }: GameProps<PatolliMiniState, PatolliMiniSettings>): JSX.Element {
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
      <div className="patollimini-wrap">
        <h2 className={`patollimini-banner ${won ? "patollimini-win" : "patollimini-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="patollimini-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="patollimini-wrap">
      <div className="patollimini-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="patollimini-meta">
        <span className="patollimini-info">Track: {TRACK_LEN}</span>
        <span className="patollimini-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="patollimini-info">Single die</span>}
        {MUST_ROLL_6 && <span className="patollimini-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="patollimini-info patollimini-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="patollimini-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="patollimini-die">{d}</div>
        )) : <div className="patollimini-die patollimini-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="patollimini-btn patollimini-btn-roll" onClick={() => dispatch({ type: "roll" } as PatolliMiniAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="patollimini-btn patollimini-btn-end" onClick={() => dispatch({ type: "endTurn" } as PatolliMiniAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="patollimini-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="patollimini-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`patollimini-cell ${sp ? "patollimini-special-" + sp.type : ""}${i === 0 ? " patollimini-start" : ""}${i === TRACK_LEN ? " patollimini-home" : ""}`}>
              <span className="patollimini-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="patollimini-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="patollimini-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="patollimini-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="patollimini-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="patollimini-sptag">★</span>}
              <div className="patollimini-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="patollimini-tok patollimini-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="patollimini-tok patollimini-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="patollimini-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="patollimini-controls">
          <div className="patollimini-label">Pick a pawn to move:</div>
          <div className="patollimini-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="patollimini-pawncard">
                  <span className="patollimini-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="patollimini-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as PatolliMiniAction)}
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
