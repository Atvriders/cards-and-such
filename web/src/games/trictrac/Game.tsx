import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrictracState, TrictracSettings, TrictracAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function TrictracGame({ state, dispatch, onGameOver }: GameProps<TrictracState, TrictracSettings>): JSX.Element {
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
      <div className="trictrac-wrap">
        <h2 className={`trictrac-banner ${won ? "trictrac-win" : "trictrac-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="trictrac-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`trictrac-point ${i % 2 === 0 ? "trictrac-even" : "trictrac-odd"}`}>
        <div className="trictrac-point-num">{i + 1}</div>
        <div className="trictrac-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="trictrac-chk trictrac-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="trictrac-chk trictrac-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="trictrac-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="trictrac-movehint">
            {myMoves.map((pips, k) => (
              <button data-testid="hint-target-trictrac-move"
                key={k}
                className="trictrac-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as TrictracAction)}
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
    <div className="trictrac-wrap">
      <div className="trictrac-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="trictrac-meta">
        <span className="trictrac-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="trictrac-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="trictrac-info">P bar: {state.pBar}</span>
            <span className="trictrac-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="trictrac-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="trictrac-info">No-hit (block)</span>}
        {THREE_DICE && <span className="trictrac-info">3 dice</span>}
      </div>
      <div className="trictrac-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="trictrac-die">{d}</div>
        )) : <div className="trictrac-die trictrac-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button data-testid="hint-target-trictrac-roll" className="trictrac-btn trictrac-btn-roll" onClick={() => dispatch({ type: "roll" } as TrictracAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button data-testid="hint-target-trictrac-endTurn" className="trictrac-btn trictrac-btn-end" onClick={() => dispatch({ type: "endTurn" } as TrictracAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="trictrac-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="trictrac-board">
        <div className="trictrac-half trictrac-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="trictrac-half trictrac-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="trictrac-bar">
          {state.pBar > 0 && <span className="trictrac-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="trictrac-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="trictrac-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
