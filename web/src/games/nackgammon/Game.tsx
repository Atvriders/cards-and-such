import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NackState, NackSettings, NackAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function NackGame({ state, dispatch, onGameOver }: GameProps<NackState, NackSettings>): JSX.Element {
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
      <div className="nack-wrap">
        <h2 className={`nack-banner ${won ? "nack-win" : "nack-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="nack-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`nack-point ${i % 2 === 0 ? "nack-even" : "nack-odd"}`}>
        <div className="nack-point-num">{i + 1}</div>
        <div className="nack-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="nack-chk nack-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="nack-chk nack-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="nack-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="nack-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="nack-movebtn"
                title="Move checker"
                onClick={() => dispatch({ type: "move", from: i, pips } as NackAction)}
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
    <div className="nack-wrap">
      <div className="nack-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="nack-meta">
        <span className="nack-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="nack-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="nack-info">P bar: {state.pBar}</span>
            <span className="nack-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="nack-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="nack-info">No-hit (block)</span>}
        {THREE_DICE && <span className="nack-info">3 dice</span>}
      </div>
      <div className="nack-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="nack-die">{d}</div>
        )) : <div className="nack-die nack-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="nack-btn nack-btn-roll" onClick={() => dispatch({ type: "roll" } as NackAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="nack-btn nack-btn-end" onClick={() => dispatch({ type: "endTurn" } as NackAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="nack-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="nack-board">
        <div className="nack-half nack-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="nack-half nack-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="nack-bar">
          {state.pBar > 0 && <span className="nack-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="nack-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="nack-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
