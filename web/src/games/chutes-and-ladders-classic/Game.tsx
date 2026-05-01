import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChutesState, ChutesSettings, ChutesAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function ChutesGame({ state, dispatch, onGameOver }: GameProps<ChutesState, ChutesSettings>): JSX.Element {
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
      <div className="chutes-cl-wrap">
        <h2 className={`chutes-cl-banner ${won ? "chutes-cl-win" : "chutes-cl-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="chutes-cl-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="chutes-cl-wrap">
      <div className="chutes-cl-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="chutes-cl-meta">
        <span className="chutes-cl-info">Track: {TRACK_LEN}</span>
        <span className="chutes-cl-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="chutes-cl-info">Single die</span>}
        {MUST_ROLL_6 && <span className="chutes-cl-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="chutes-cl-info chutes-cl-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="chutes-cl-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="chutes-cl-die">{d}</div>
        )) : <div className="chutes-cl-die chutes-cl-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="chutes-cl-btn chutes-cl-btn-roll" onClick={() => dispatch({ type: "roll" } as ChutesAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="chutes-cl-btn chutes-cl-btn-end" onClick={() => dispatch({ type: "endTurn" } as ChutesAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="chutes-cl-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="chutes-cl-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`chutes-cl-cell ${sp ? "chutes-cl-special-" + sp.type : ""}${i === 0 ? " chutes-cl-start" : ""}${i === TRACK_LEN ? " chutes-cl-home" : ""}`}>
              <span className="chutes-cl-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="chutes-cl-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="chutes-cl-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="chutes-cl-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="chutes-cl-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="chutes-cl-sptag">★</span>}
              <div className="chutes-cl-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="chutes-cl-tok chutes-cl-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="chutes-cl-tok chutes-cl-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="chutes-cl-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="chutes-cl-controls">
          <div className="chutes-cl-label">Pick a pawn to move:</div>
          <div className="chutes-cl-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="chutes-cl-pawncard">
                  <span className="chutes-cl-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="chutes-cl-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as ChutesAction)}
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
