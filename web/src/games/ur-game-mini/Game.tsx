import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UrMiniState, UrMiniSettings, UrMiniAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function UrMiniGame({ state, dispatch, onGameOver }: GameProps<UrMiniState, UrMiniSettings>): JSX.Element {
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
      <div className="ur-mini-wrap">
        <h2 className={`ur-mini-banner ${won ? "ur-mini-win" : "ur-mini-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="ur-mini-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="ur-mini-wrap">
      <div className="ur-mini-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="ur-mini-meta">
        <span className="ur-mini-info">Track: {TRACK_LEN}</span>
        <span className="ur-mini-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="ur-mini-info">Single die</span>}
        {MUST_ROLL_6 && <span className="ur-mini-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="ur-mini-info ur-mini-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="ur-mini-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="ur-mini-die">{d}</div>
        )) : <div className="ur-mini-die ur-mini-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="ur-mini-btn ur-mini-btn-roll" onClick={() => dispatch({ type: "roll" } as UrMiniAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="ur-mini-btn ur-mini-btn-end" onClick={() => dispatch({ type: "endTurn" } as UrMiniAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="ur-mini-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="ur-mini-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`ur-mini-cell ${sp ? "ur-mini-special-" + sp.type : ""}${i === 0 ? " ur-mini-start" : ""}${i === TRACK_LEN ? " ur-mini-home" : ""}`}>
              <span className="ur-mini-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="ur-mini-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="ur-mini-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="ur-mini-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="ur-mini-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="ur-mini-sptag">★</span>}
              <div className="ur-mini-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="ur-mini-tok ur-mini-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="ur-mini-tok ur-mini-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="ur-mini-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="ur-mini-controls">
          <div className="ur-mini-label">Pick a pawn to move:</div>
          <div className="ur-mini-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="ur-mini-pawncard">
                  <span className="ur-mini-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="ur-mini-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as UrMiniAction)}
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
