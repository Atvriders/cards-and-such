import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  QwixxFullState,
  QwixxFullAction,
  Color,
  QwixxFullSettings,
} from "./state.js";
import {
  isTerminal,
  calcScore,
  canCross,
  COLORS,
  ROW_VALUES,
} from "./state.js";
import "./Game.css";

const PLAYER_LABELS = ["You", "CPU 1", "CPU 2"];

function rightmost(checked: readonly boolean[]): number {
  for (let i = checked.length - 1; i >= 0; i--) if (checked[i]) return i;
  return -1;
}

export function QwixxFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<QwixxFullState, QwixxFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Drive CPU turns automatically.
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.active === 0) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as QwixxFullAction);
    }, 650);
    return () => window.clearTimeout(id);
  }, [state.active, state.phase, state.rollCount, dispatch]);

  const isHumanTurn = state.active === 0 && state.phase === "rolled";
  const whiteSum = state.whiteDice[0] + state.whiteDice[1];

  function whiteMarkable(color: Color, index: number): boolean {
    if (state.phase !== "rolled") return false;
    if (state.whiteActed[0]) return false;
    if (state.locked[color]) return false;
    const vals = ROW_VALUES[color];
    if (vals[index] !== whiteSum) return false;
    const card = state.players[0];
    if (!card) return false;
    return canCross(card.checked[color], state.locked[color], index);
  }

  function colorMarkable(color: Color, index: number): boolean {
    if (!isHumanTurn) return false;
    if (state.activeMadeColorMark) return false;
    if (state.locked[color]) return false;
    const cv = state.colorDice[color];
    const s1 = state.whiteDice[0] + cv;
    const s2 = state.whiteDice[1] + cv;
    const vals = ROW_VALUES[color];
    if (vals[index] !== s1 && vals[index] !== s2) return false;
    const card = state.players[0];
    if (!card) return false;
    return canCross(card.checked[color], state.locked[color], index);
  }

  function handleCellClick(color: Color, index: number): void {
    if (colorMarkable(color, index)) {
      dispatch({ type: "markColor", color, index } as QwixxFullAction);
      return;
    }
    if (whiteMarkable(color, index)) {
      dispatch({
        type: "markWhite",
        player: 0,
        color,
        index,
      } as QwixxFullAction);
    }
  }

  const lockedCount = COLORS.reduce((n, c) => n + (state.locked[c] ? 1 : 0), 0);

  return (
    <div className="qxf-wrap fade-in">
      <header className="qxf-header">
        <div className="qxf-title">Qwixx (Full)</div>
        <div className="qxf-meta">
          Round {state.rollCount} | Locked: {lockedCount} / 4 | Turn:{" "}
          <strong>{PLAYER_LABELS[state.active] ?? `P${state.active + 1}`}</strong>
        </div>
      </header>

      <section className="qxf-dice-panel">
        {state.phase === "rolled" ? (
          <div className="qxf-dice">
            <span className="qxf-die qxf-die-white" title="White die 1">
              {state.whiteDice[0]}
            </span>
            <span className="qxf-die qxf-die-white" title="White die 2">
              {state.whiteDice[1]}
            </span>
            <span className="qxf-die qxf-die-red" title="Red die">
              {state.colorDice.red}
            </span>
            <span className="qxf-die qxf-die-yellow" title="Yellow die">
              {state.colorDice.yellow}
            </span>
            <span className="qxf-die qxf-die-green" title="Green die">
              {state.colorDice.green}
            </span>
            <span className="qxf-die qxf-die-blue" title="Blue die">
              {state.colorDice.blue}
            </span>
            <span className="qxf-sum" title="White dice sum">
              White sum: <strong>{whiteSum}</strong>
            </span>
          </div>
        ) : (
          <div className="qxf-dice-empty">
            {state.active === 0
              ? "Click Roll to start your turn."
              : `Waiting for ${PLAYER_LABELS[state.active] ?? "CPU"}…`}
          </div>
        )}
      </section>

      <section className="qxf-cards">
        {state.players.map((card, pIdx) => {
          const isYou = pIdx === 0;
          const isActive = pIdx === state.active;
          return (
            <div
              key={pIdx}
              className={`qxf-card ${isYou ? "qxf-card-you" : ""} ${isActive ? "qxf-card-active" : ""}`}
            >
              <div className="qxf-card-head">
                <span className="qxf-card-name">
                  {PLAYER_LABELS[pIdx] ?? `P${pIdx + 1}`}
                  {isActive ? " (active)" : ""}
                </span>
                <span className="qxf-card-score pulse">
                  {calcScore(state, pIdx)} pts
                </span>
                <span
                  className="qxf-card-penalties"
                  title={`${card.penalties} penalty marks`}
                >
                  {"X".repeat(card.penalties)}
                  {"·".repeat(Math.max(0, 4 - card.penalties))}
                </span>
              </div>
              {COLORS.map((color) => {
                const vals = ROW_VALUES[color];
                const checked = card.checked[color];
                const rm = rightmost(checked);
                return (
                  <div
                    key={color}
                    className={`qxf-row qxf-row-${color} ${state.locked[color] ? "qxf-locked" : ""}`}
                  >
                    <span className="qxf-row-label">{color}</span>
                    {vals.map((v, i) => {
                      const isChecked = checked[i] === true;
                      const interactable = isYou && state.phase === "rolled";
                      const w = interactable && whiteMarkable(color, i);
                      const c = interactable && colorMarkable(color, i);
                      const ahead = i <= rm && !isChecked;
                      const isLockCell = i === vals.length - 1;
                      const labelTitle = isLockCell
                        ? `${v} — locks ${color} row (needs 5 prior crosses)`
                        : `${color} ${v}`;
                      const cellClass = [
                        "qxf-cell",
                        isChecked ? "qxf-cell-checked" : "",
                        w ? "qxf-cell-white" : "",
                        c ? "qxf-cell-color" : "",
                        ahead ? "qxf-cell-blocked" : "",
                        isLockCell ? "qxf-cell-lock" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <button
                          key={i}
                          type="button"
                          className={cellClass}
                          disabled={!isYou || (!w && !c) || isChecked}
                          title={labelTitle}
                          aria-label={`${PLAYER_LABELS[pIdx] ?? `P${pIdx + 1}`} ${color} ${v}${isChecked ? " crossed" : ""}`}
                          onClick={() => isYou && handleCellClick(color, i)}
                        >
                          {isChecked ? "X" : isLockCell ? `${v}🔒` : v}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      <section className="qxf-controls">
        {state.phase === "preRoll" && state.active === 0 && (
          <button
            type="button"
            data-testid="qwixx-full-roll"
            className="qxf-btn qxf-btn-primary"
            title="Roll all six dice"
            onClick={() => dispatch({ type: "roll" } as QwixxFullAction)}
          >
            Roll Dice
          </button>
        )}
        {state.phase === "preRoll" && state.active !== 0 && (
          <button
            type="button"
            data-testid="qwixx-full-cpu-step"
            className="qxf-btn"
            title="Advance the CPU turn"
            onClick={() =>
              dispatch({ type: "cpuStep" } as QwixxFullAction)
            }
          >
            CPU Roll
          </button>
        )}
        {state.phase === "rolled" && state.active === 0 && (
          <>
            <button
              type="button"
              data-testid="qwixx-full-end-turn"
              className="qxf-btn qxf-btn-primary"
              title="Finish your turn (penalty if no cross marked)"
              onClick={() =>
                dispatch({ type: "endTurn" } as QwixxFullAction)
              }
            >
              End Turn
            </button>
            <button
              type="button"
              data-testid="qwixx-full-take-penalty"
              className="qxf-btn qxf-btn-warn"
              title="Take a -5 penalty and skip"
              disabled={
                state.activeMadeWhiteMark || state.activeMadeColorMark
              }
              onClick={() =>
                dispatch({ type: "takePenalty" } as QwixxFullAction)
              }
            >
              Take Penalty
            </button>
          </>
        )}
      </section>

      {state.lastEvent && (
        <div className="qxf-event" aria-live="polite">
          {state.lastEvent}
        </div>
      )}

      {terminal && (
        <div className="qxf-final bounce-in">
          <div className="qxf-final-title">Game Over</div>
          <ul className="qxf-final-list">
            {state.players.map((_, i) => (
              <li
                key={i}
                className={i === 0 ? "qxf-final-you" : ""}
              >
                {PLAYER_LABELS[i] ?? `P${i + 1}`}: <strong>{calcScore(state, i)}</strong> pts
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
