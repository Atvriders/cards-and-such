import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TabulaState, TabulaSettings, TabulaAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function TabulaGame({ state, dispatch, onGameOver }: GameProps<TabulaState, TabulaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const moves = state.turn === "P" && state.phase === "moving" ? legalMoves(state, "P") : [];
  const movesByFrom = new Map<number, number[]>();
  for (const m of moves) {
    if (!movesByFrom.has(m.from)) movesByFrom.set(m.from, []);
    movesByFrom.get(m.from)!.push(m.pips);
  }

  const isPTurn = state.turn === "P";
  const halfA = Math.floor(POINTS / 2);

  if (state.phase === "done") {
    const won = state.winner === "P";
    return (
      <div className="tabula-wrap">
        <h2 className={`tabula-banner ${won ? "tabula-win" : "tabula-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="tabula-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`tabula-point ${i % 2 === 0 ? "tabula-even" : "tabula-odd"}`}>
        <div className="tabula-point-num">{i + 1}</div>
        <div className="tabula-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="tabula-chk tabula-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="tabula-chk tabula-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="tabula-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="tabula-movehint">
            {myMoves.map((pips, k) => (
              <button data-testid="hint-target-tabula-game-move"
                key={k}
                className="tabula-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as TabulaAction)}
              >
                +{pips}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tabula-wrap">
      <div className="tabula-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="tabula-meta">
        <span className="tabula-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="tabula-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="tabula-info">P bar: {state.pBar}</span>
            <span className="tabula-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="tabula-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="tabula-info">No-hit (block)</span>}
        {THREE_DICE && <span className="tabula-info">3 dice</span>}
      </div>
      <div className="tabula-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="tabula-die">{d}</div>
        )) : <div className="tabula-die tabula-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button data-testid="hint-target-tabula-game-roll" className="tabula-btn tabula-btn-roll" onClick={() => dispatch({ type: "roll" } as TabulaAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button data-testid="hint-target-tabula-game-endTurn" className="tabula-btn tabula-btn-end" onClick={() => dispatch({ type: "endTurn" } as TabulaAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="tabula-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="tabula-board">
        <div className="tabula-half tabula-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="tabula-half tabula-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="tabula-bar">
          {state.pBar > 0 && <span className="tabula-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="tabula-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="tabula-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
