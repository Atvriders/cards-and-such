import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HyperBgState, HyperBgSettings, HyperBgAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function HyperBgGame({ state, dispatch, onGameOver }: GameProps<HyperBgState, HyperBgSettings>): JSX.Element {
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
      <div className="hyperbg-wrap">
        <h2 className={`hyperbg-banner ${won ? "hyperbg-win" : "hyperbg-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="hyperbg-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`hyperbg-point ${i % 2 === 0 ? "hyperbg-even" : "hyperbg-odd"}`}>
        <div className="hyperbg-point-num">{i + 1}</div>
        <div className="hyperbg-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="hyperbg-chk hyperbg-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="hyperbg-chk hyperbg-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="hyperbg-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="hyperbg-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                title={`Move ${pips} pips`}
                className="hyperbg-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as HyperBgAction)}
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
    <div className="hyperbg-wrap">
      <div className="hyperbg-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="hyperbg-meta">
        <span className="hyperbg-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="hyperbg-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="hyperbg-info">P bar: {state.pBar}</span>
            <span className="hyperbg-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="hyperbg-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="hyperbg-info">No-hit (block)</span>}
        {THREE_DICE && <span className="hyperbg-info">3 dice</span>}
      </div>
      <div className="hyperbg-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="hyperbg-die">{d}</div>
        )) : <div className="hyperbg-die hyperbg-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="hyperbg-btn hyperbg-btn-roll" onClick={() => dispatch({ type: "roll" } as HyperBgAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="hyperbg-btn hyperbg-btn-end" onClick={() => dispatch({ type: "endTurn" } as HyperBgAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="hyperbg-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="hyperbg-board">
        <div className="hyperbg-half hyperbg-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="hyperbg-half hyperbg-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="hyperbg-bar">
          {state.pBar > 0 && <span className="hyperbg-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="hyperbg-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="hyperbg-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
