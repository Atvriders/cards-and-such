import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTennisState, DiceTennisSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const POINT_LABELS = ["0", "15", "30", "40", "Game"];

export function DiceTennis({ state, dispatch, onGameOver }: GameProps<DiceTennisState, DiceTennisSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";

  return (
    <div className="dice-tennis fade-in">
      <div className="dt-scoreboard">
        <div className="dt-score-col pulse">
          <span className="dt-label">You</span>
          <span className="dt-sets">{state.playerSets}</span>
          <span className="dt-games">{state.playerGames}</span>
          <span className="dt-points">{POINT_LABELS[state.playerPoints] ?? "Ad"}</span>
        </div>
        <div className="dt-score-sep pulse">
          <span>Sets</span>
          <span>Games</span>
          <span>Points</span>
        </div>
        <div className="dt-score-col pulse">
          <span className="dt-label">AI</span>
          <span className="dt-sets">{state.aiSets}</span>
          <span className="dt-games">{state.aiGames}</span>
          <span className="dt-points">{POINT_LABELS[state.aiPoints] ?? "Ad"}</span>
        </div>
      </div>

      <div className="dt-court-info">Set {Math.min(state.currentSet, state.totalSets)}/{state.totalSets}</div>

      <div className="dt-rally">{state.lastRally}</div>

      {state.lastDice.length > 0 && (
        <div className="dt-dice">
          {state.lastDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? d}</span>)}
        </div>
      )}

      {!isOver && (
        <div className="dt-controls">
          <button data-testid="hint-target-dice-tennis-serve" onClick={() => dispatch({ type: "serve", style: "flat" })}>Flat (14+)</button>
          <button data-testid="hint-target-dice-tennis-serve" onClick={() => dispatch({ type: "serve", style: "spin" })}>Spin (11+)</button>
          <button data-testid="hint-target-dice-tennis-serve" onClick={() => dispatch({ type: "serve", style: "slice" })}>Slice (9+)</button>
        </div>
      )}

      {isOver && (
        <div className="dt-result">
          {state.playerSets > state.aiSets ? "Match won!" :
           state.playerSets < state.aiSets ? "AI wins the match!" : "Draw!"}
        </div>
      )}

      <button className="dt-restart" onClick={() => dispatch({ type: "restart" })}>New Match</button>
    </div>
  );
}
