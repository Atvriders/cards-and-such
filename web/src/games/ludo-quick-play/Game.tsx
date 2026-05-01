import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LudoQuickState, LudoQuickSettings, LudoQuickAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function LudoQuickGame({ state, dispatch, onGameOver }: GameProps<LudoQuickState, LudoQuickSettings>): JSX.Element {
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
      <div className="ludoquick-wrap">
        <h2 className={`ludoquick-banner ${won ? "ludoquick-win" : "ludoquick-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="ludoquick-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="ludoquick-wrap">
      <div className="ludoquick-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="ludoquick-meta">
        <span className="ludoquick-info">Track: {TRACK_LEN}</span>
        <span className="ludoquick-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="ludoquick-info">Single die</span>}
        {MUST_ROLL_6 && <span className="ludoquick-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="ludoquick-info ludoquick-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="ludoquick-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="ludoquick-die">{d}</div>
        )) : <div className="ludoquick-die ludoquick-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="ludoquick-btn ludoquick-btn-roll" onClick={() => dispatch({ type: "roll" } as LudoQuickAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="ludoquick-btn ludoquick-btn-end" onClick={() => dispatch({ type: "endTurn" } as LudoQuickAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="ludoquick-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="ludoquick-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`ludoquick-cell ${sp ? "ludoquick-special-" + sp.type : ""}${i === 0 ? " ludoquick-start" : ""}${i === TRACK_LEN ? " ludoquick-home" : ""}`}>
              <span className="ludoquick-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="ludoquick-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="ludoquick-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="ludoquick-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="ludoquick-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="ludoquick-sptag">★</span>}
              <div className="ludoquick-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="ludoquick-tok ludoquick-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="ludoquick-tok ludoquick-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="ludoquick-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="ludoquick-controls">
          <div className="ludoquick-label">Pick a pawn to move:</div>
          <div className="ludoquick-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="ludoquick-pawncard">
                  <span className="ludoquick-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      className="ludoquick-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as LudoQuickAction)}
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
