import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  YahtzeeFullMatchState,
  YahtzeeFullMatchAction,
  YahtzeeFullMatchSettings,
  Category,
  PlayerCard,
} from "./state.js";
import {
  ALL_CATEGORIES,
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
  CATEGORY_LABELS,
  computeCategoryScore,
  upperSum,
  upperBonus,
  totalScore,
  isTerminal,
} from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function YahtzeeFullMatchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<YahtzeeFullMatchState, YahtzeeFullMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-run the CPU's turn after a short pause so the player sees the message.
  useEffect(() => {
    if (state.phase === "cpuTurn" && state.turn === "cpu") {
      const t = setTimeout(() => {
        dispatch({ type: "cpuTurn" } as YahtzeeFullMatchAction);
      }, 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state.phase, state.turn, dispatch]);

  const canRoll = state.turn === "player" && state.phase === "rolling" && state.rollsUsed < 3;
  const canToggle = state.turn === "player" && state.phase === "rolling" && state.rollsUsed > 0;
  const canScore = state.turn === "player" && state.rollsUsed > 0 && state.phase !== "done";

  function handleToggle(i: number) {
    if (!canToggle) return;
    dispatch({ type: "toggleKeep", index: i } as YahtzeeFullMatchAction);
  }

  function handleScore(cat: Category) {
    if (!canScore) return;
    if (cat in state.player.scores) return;
    dispatch({ type: "score", category: cat } as YahtzeeFullMatchAction);
  }

  const playerTotal = totalScore(state.player);
  const cpuTotal = totalScore(state.cpu);
  const winner =
    terminal == null
      ? null
      : playerTotal > cpuTotal
      ? "You win!"
      : playerTotal < cpuTotal
      ? "CPU wins."
      : "Tie game.";

  function renderRow(cat: Category) {
    const used = cat in state.player.scores;
    const potential =
      canScore && !used ? computeCategoryScore(state.dice, cat, state.player) : null;
    const cpuVal = state.cpu.scores[cat];
    return (
      <tr
        key={cat}
        className={used ? "used" : canScore && !used ? "clickable" : ""}
      >
        <td className="cat-label">{CATEGORY_LABELS[cat]}</td>
        <td
          data-testid={`hint-target-yahtzee-full-match-cat-${cat}`}
          className={
            used
              ? "score-cell filled"
              : potential !== null
              ? "score-cell potential"
              : "score-cell"
          }
          onClick={used ? undefined : () => handleScore(cat)}
          title={
            used
              ? `Scored ${state.player.scores[cat]}`
              : potential !== null
              ? `Score ${potential} in ${CATEGORY_LABELS[cat]}`
              : "Roll first"
          }
        >
          {used ? state.player.scores[cat] : potential !== null ? potential : "—"}
        </td>
        <td className="cpu-cell">{cpuVal ?? "·"}</td>
      </tr>
    );
  }

  function sectionStats(card: PlayerCard) {
    const us = upperSum(card);
    const bonus = upperBonus(card);
    return { us, bonus };
  }

  const playerStats = sectionStats(state.player);
  const cpuStats = sectionStats(state.cpu);

  return (
    <div className="yfm fade-in">
      <div className="yfm-header">
        <div className="yfm-info">
          <span>Round {Math.min(state.round, 13)} / 13</span>
          <span>
            Turn:{" "}
            <strong>{state.turn === "player" ? "You" : "CPU"}</strong>
          </span>
          <span>Roll {state.rollsUsed} / 3</span>
        </div>
        <div className="yfm-scoreboard pulse">
          <div>
            You: <strong>{playerTotal}</strong>
          </div>
          <div>
            CPU: <strong>{cpuTotal}</strong>
          </div>
        </div>
      </div>

      <div className="yfm-message">{state.message}</div>

      <div className="yfm-dice">
        {state.dice.map((d, i) => (
          <Die key={i} value={d.value} kept={d.kept} onClick={() => handleToggle(i)} />
        ))}
      </div>

      <div className="yfm-controls">
        <button
          type="button"
          data-testid="hint-target-yahtzee-full-match-roll"
          onClick={() => dispatch({ type: "roll" } as YahtzeeFullMatchAction)}
          disabled={!canRoll}
          title={
            state.rollsUsed === 0 ? "Roll all five dice" : "Re-roll dice not held"
          }
        >
          {state.rollsUsed === 0 ? "Roll Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      <table className="yfm-card">
        <thead>
          <tr>
            <th>Category</th>
            <th>You</th>
            <th>CPU</th>
          </tr>
        </thead>
        <tbody>
          <tr className="section">
            <td colSpan={3}>Upper Section</td>
          </tr>
          {UPPER_CATEGORIES.map(renderRow)}
          <tr className="bonus">
            <td>Upper Bonus (need 63)</td>
            <td>
              {playerStats.bonus > 0
                ? "+35"
                : `${playerStats.us}/63`}
            </td>
            <td>
              {cpuStats.bonus > 0
                ? "+35"
                : `${cpuStats.us}/63`}
            </td>
          </tr>
          <tr className="section">
            <td colSpan={3}>Lower Section</td>
          </tr>
          {LOWER_CATEGORIES.map(renderRow)}
          <tr className="bonus">
            <td>Yahtzee Bonus chips (+100 each)</td>
            <td>{state.player.yahtzeeBonus}</td>
            <td>{state.cpu.yahtzeeBonus}</td>
          </tr>
          <tr className="total">
            <td>Grand Total</td>
            <td>{playerTotal}</td>
            <td>{cpuTotal}</td>
          </tr>
        </tbody>
      </table>

      {terminal && (
        <div className="yfm-done bounce-in" data-testid="hint-target-yahtzee-full-match-done">
          <div className="yfm-done-title">{winner}</div>
          <div className="yfm-done-sub">
            Final: You {playerTotal} — CPU {cpuTotal}
          </div>
        </div>
      )}
    </div>
  );
}

// Mark unused export to silence linter when imported lazily — ALL_CATEGORIES is referenced
// implicitly via UPPER/LOWER. Keep this guard simple.
void ALL_CATEGORIES;
