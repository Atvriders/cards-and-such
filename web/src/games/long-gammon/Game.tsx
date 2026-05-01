import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LongState, LongSettings, LongAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function LongGame({ state, dispatch, onGameOver }: GameProps<LongState, LongSettings>): JSX.Element {
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
      <div className="longgam-wrap">
        <h2 className={`longgam-banner ${won ? "longgam-win" : "longgam-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="longgam-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`longgam-point ${i % 2 === 0 ? "longgam-even" : "longgam-odd"}`}>
        <div className="longgam-point-num">{i + 1}</div>
        <div className="longgam-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="longgam-chk longgam-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="longgam-chk longgam-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="longgam-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="longgam-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="longgam-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as LongAction)}
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
    <div className="longgam-wrap">
      <div className="longgam-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="longgam-meta">
        <span className="longgam-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="longgam-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="longgam-info">P bar: {state.pBar}</span>
            <span className="longgam-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="longgam-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="longgam-info">No-hit (block)</span>}
        {THREE_DICE && <span className="longgam-info">3 dice</span>}
      </div>
      <div className="longgam-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="longgam-die">{d}</div>
        )) : <div className="longgam-die longgam-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="longgam-btn longgam-btn-roll" onClick={() => dispatch({ type: "roll" } as LongAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="longgam-btn longgam-btn-end" onClick={() => dispatch({ type: "endTurn" } as LongAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="longgam-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="longgam-board">
        <div className="longgam-half longgam-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="longgam-half longgam-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="longgam-bar">
          {state.pBar > 0 && <span className="longgam-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="longgam-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="longgam-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
