import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MenschState, MenschSettings, MenschAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function MenschGame({ state, dispatch, onGameOver }: GameProps<MenschState, MenschSettings>): JSX.Element {
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
      <div className="mensch-wrap">
        <h2 className={`mensch-banner ${won ? "mensch-win" : "mensch-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="mensch-score pulse">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="mensch-wrap">
      <div className="mensch-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="mensch-meta">
        <span className="mensch-info">Track: {TRACK_LEN}</span>
        <span className="mensch-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="mensch-info">Single die</span>}
        {MUST_ROLL_6 && <span className="mensch-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="mensch-info mensch-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="mensch-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="mensch-die">{d}</div>
        )) : <div className="mensch-die mensch-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="mensch-btn mensch-btn-roll" onClick={() => dispatch({ type: "roll" } as MenschAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="mensch-btn mensch-btn-end" onClick={() => dispatch({ type: "endTurn" } as MenschAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="mensch-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="mensch-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`mensch-cell ${sp ? "mensch-special-" + sp.type : ""}${i === 0 ? " mensch-start" : ""}${i === TRACK_LEN ? " mensch-home" : ""}`}>
              <span className="mensch-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="mensch-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="mensch-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="mensch-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="mensch-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="mensch-sptag">★</span>}
              <div className="mensch-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="mensch-tok mensch-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="mensch-tok mensch-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="mensch-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="mensch-controls">
          <div className="mensch-label">Pick a pawn to move:</div>
          <div className="mensch-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="mensch-pawncard">
                  <span className="mensch-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      title="Move pawn"
                      className="mensch-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as MenschAction)}
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
