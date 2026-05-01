import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SenetMiniState, SenetMiniSettings, SenetMiniAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function SenetMiniGame({ state, dispatch, onGameOver }: GameProps<SenetMiniState, SenetMiniSettings>): JSX.Element {
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
      <div className="senet-mini-wrap">
        <h2 className={`senet-mini-banner ${won ? "senet-mini-win" : "senet-mini-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="senet-mini-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="senet-mini-wrap">
      <div className="senet-mini-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="senet-mini-meta">
        <span className="senet-mini-info">Track: {TRACK_LEN}</span>
        <span className="senet-mini-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="senet-mini-info">Single die</span>}
        {MUST_ROLL_6 && <span className="senet-mini-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="senet-mini-info senet-mini-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="senet-mini-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="senet-mini-die">{d}</div>
        )) : <div className="senet-mini-die senet-mini-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="senet-mini-btn senet-mini-btn-roll" onClick={() => dispatch({ type: "roll" } as SenetMiniAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="senet-mini-btn senet-mini-btn-end" onClick={() => dispatch({ type: "endTurn" } as SenetMiniAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="senet-mini-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="senet-mini-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`senet-mini-cell ${sp ? "senet-mini-special-" + sp.type : ""}${i === 0 ? " senet-mini-start" : ""}${i === TRACK_LEN ? " senet-mini-home" : ""}`}>
              <span className="senet-mini-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="senet-mini-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="senet-mini-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="senet-mini-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="senet-mini-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="senet-mini-sptag">★</span>}
              <div className="senet-mini-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="senet-mini-tok senet-mini-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="senet-mini-tok senet-mini-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="senet-mini-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="senet-mini-controls">
          <div className="senet-mini-label">Pick a pawn to move:</div>
          <div className="senet-mini-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="senet-mini-pawncard">
                  <span className="senet-mini-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="senet-mini-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as SenetMiniAction)}
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
