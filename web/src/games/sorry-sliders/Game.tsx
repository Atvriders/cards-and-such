import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SorrySlidersState, SorrySlidersSettings, SorrySlidersAction } from "./state.js";
import { isTerminal, legalMovesForP, TRACK_LEN, PAWNS_PER_SIDE, SPECIALS, SINGLE_DIE, MUST_ROLL_6 } from "./state.js";
import "./Game.css";

export function SorrySlidersGame({ state, dispatch, onGameOver }: GameProps<SorrySlidersState, SorrySlidersSettings>): JSX.Element {
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
      <div className="sorrysliders-wrap">
        <h2 className={`sorrysliders-banner ${won ? "sorrysliders-win" : "sorrysliders-loss"}`}>{won ? "You won the race!" : "CPU won the race!"}</h2>
        <div className="sorrysliders-score">Final score: {state.score}</div>
      </div>
    );
  }

  const cells: number[] = Array.from({ length: TRACK_LEN + 1 }, (_, i) => i);

  return (
    <div className="sorrysliders-wrap">
      <div className="sorrysliders-status">
        {isPTurn
          ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your pawns.")
          : "CPU is moving..."}
      </div>
      <div className="sorrysliders-meta">
        <span className="sorrysliders-info">Track: {TRACK_LEN}</span>
        <span className="sorrysliders-info">Pawns: {PAWNS_PER_SIDE}</span>
        {SINGLE_DIE && <span className="sorrysliders-info">Single die</span>}
        {MUST_ROLL_6 && <span className="sorrysliders-info">Roll 6 to enter</span>}
        {state.lastBumped && <span className="sorrysliders-info sorrysliders-bump">{state.lastBumped} bumped!</span>}
      </div>
      <div className="sorrysliders-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="sorrysliders-die">{d}</div>
        )) : <div className="sorrysliders-die sorrysliders-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="sorrysliders-btn sorrysliders-btn-roll" onClick={() => dispatch({ type: "roll" } as SorrySlidersAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="sorrysliders-btn sorrysliders-btn-end" onClick={() => dispatch({ type: "endTurn" } as SorrySlidersAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="sorrysliders-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="sorrysliders-board">
        {cells.map(i => {
          const sp = SPECIALS[i];
          const pPawnsHere = state.pPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          const cPawnsHere = state.cPos.map((p, idx) => p === i ? idx : -1).filter(x => x >= 0);
          return (
            <div key={i} className={`sorrysliders-cell ${sp ? "sorrysliders-special-" + sp.type : ""}${i === 0 ? " sorrysliders-start" : ""}${i === TRACK_LEN ? " sorrysliders-home" : ""}`}>
              <span className="sorrysliders-cellnum">{i}</span>
              {sp && sp.type === "ladder" && <span className="sorrysliders-sptag">L→{sp.to}</span>}
              {sp && sp.type === "snake" && <span className="sorrysliders-sptag">S→{sp.to}</span>}
              {sp && sp.type === "slide" && <span className="sorrysliders-sptag">»→{sp.to}</span>}
              {sp && sp.type === "hub" && <span className="sorrysliders-sptag">⌬→{sp.to}</span>}
              {sp && sp.type === "safe" && <span className="sorrysliders-sptag">★</span>}
              <div className="sorrysliders-tokens">
                {pPawnsHere.map(idx => <span key={`p${idx}`} className="sorrysliders-tok sorrysliders-tok-p">{idx + 1}</span>)}
                {cPawnsHere.map(idx => <span key={`c${idx}`} className="sorrysliders-tok sorrysliders-tok-c">{idx + 1}</span>)}
              </div>
            </div>
          );
        })}
      </div>
      {MUST_ROLL_6 && state.pPos.some(p => p === -1) && (
        <div className="sorrysliders-penalty">Pawns waiting to enter: {state.pPos.filter(p => p === -1).length}</div>
      )}
      {isPTurn && state.phase === "moving" && (
        <div className="sorrysliders-controls">
          <div className="sorrysliders-label">Pick a pawn to move:</div>
          <div className="sorrysliders-pawnrow">
            {state.pPos.map((p, idx) => {
              const opts = movesByPawn.get(idx) || [];
              const desc = p === -1 ? "(off-board)" : (p === TRACK_LEN ? "(home)" : `@ ${p}`);
              return (
                <div key={idx} className="sorrysliders-pawncard">
                  <span className="sorrysliders-pawnname">P{idx + 1} {desc}</span>
                  {opts.map((pips, k) => (
                    <button
                      key={k}
                      title={`Move ${pips} spaces`}
                      className="sorrysliders-movebtn"
                      onClick={() => dispatch({ type: "move", pawnIdx: idx, pips } as SorrySlidersAction)}
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
