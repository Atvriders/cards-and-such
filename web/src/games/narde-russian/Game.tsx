import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NardeState, NardeSettings, NardeAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function NardeGame({ state, dispatch, onGameOver }: GameProps<NardeState, NardeSettings>): JSX.Element {
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
      <div className="narde-wrap">
        <h2 className={`narde-banner ${won ? "narde-win" : "narde-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="narde-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`narde-point ${i % 2 === 0 ? "narde-even" : "narde-odd"}`}>
        <div className="narde-point-num">{i + 1}</div>
        <div className="narde-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="narde-chk narde-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="narde-chk narde-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="narde-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="narde-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="narde-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as NardeAction)}
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
    <div className="narde-wrap">
      <div className="narde-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="narde-meta">
        <span className="narde-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="narde-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="narde-info">P bar: {state.pBar}</span>
            <span className="narde-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="narde-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="narde-info">No-hit (block)</span>}
        {THREE_DICE && <span className="narde-info">3 dice</span>}
      </div>
      <div className="narde-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="narde-die">{d}</div>
        )) : <div className="narde-die narde-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="narde-btn narde-btn-roll" onClick={() => dispatch({ type: "roll" } as NardeAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="narde-btn narde-btn-end" onClick={() => dispatch({ type: "endTurn" } as NardeAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="narde-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="narde-board">
        <div className="narde-half narde-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="narde-half narde-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="narde-bar">
          {state.pBar > 0 && <span className="narde-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="narde-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="narde-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
