import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LudoMiniState, LudoMiniSettings, LudoMiniAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function LudoMiniGame({ state, dispatch, onGameOver }: GameProps<LudoMiniState, LudoMiniSettings>): JSX.Element {
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
      <div className="ludomini-wrap">
        <h2 className={`ludomini-banner ${won ? "ludomini-win" : "ludomini-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="ludomini-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="ludomini-wrap">
      <div className="ludomini-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="ludomini-meta">
        <span className="ludomini-info">Track: {TRACK_LEN}</span>
        <span className="ludomini-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="ludomini-info">Single die</span>}
        {MUST_ROLL_6 && <span className="ludomini-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="ludomini-info ludomini-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="ludomini-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="ludomini-die">{d}</div>
        )) : <div className="ludomini-die ludomini-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="ludomini-btn ludomini-btn-roll" onClick={() => dispatch({ type: "roll" } as LudoMiniAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="ludomini-btn ludomini-btn-end" onClick={() => dispatch({ type: "endTurn" } as LudoMiniAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="ludomini-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="ludomini-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`ludomini-cell ${sp ? "ludomini-special-" + sp.type : ""}${i === 0 ? " ludomini-start" : ""}${i === TRACK_LEN ? " ludomini-home" : ""}`}>
              <span className="ludomini-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="ludomini-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="ludomini-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="ludomini-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="ludomini-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="ludomini-sptag">★</span>}
              <div className="ludomini-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="ludomini-tok ludomini-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="ludomini-tok ludomini-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="ludomini-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="ludomini-controls">
          <div className="ludomini-label">Pick a pawn to move:</div>
          <div className="ludomini-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="ludomini-pawncard">
                  <span className="ludomini-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="ludomini-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as LudoMiniAction)}
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
