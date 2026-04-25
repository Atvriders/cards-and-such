import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSpinPickState, CardSpinPickAction, CardSpinPickSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardSpinPick({ state, dispatch, onGameOver }: GameProps<CardSpinPickState, CardSpinPickSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="csp-wrap"><div className="csp-done">
      <h2>Spin Done!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#8e44ad" }}>{state.score} pts</p>
    </div></div>
  );

  const isSpun = state.phase === "spun";
  return (
    <div className="csp-wrap">
      <div className="csp-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="csp-score">{state.score} pts</span>
      </div>
      <p className="csp-hint">{isSpun ? (state.spinResult === state.playerPick ? "Match! +100" : `Spinner chose ${state.spinResult! + 1} — +10`) : "Pick a card, then Spin!"}</p>
      <div className="csp-cards">
        {state.rowCards.map((card, i) => (
          <button key={i} className={`csp-card ${state.playerPick === i ? "picked" : ""} ${isSpun && state.spinResult === i ? "spun" : ""}`}
            onClick={() => !isSpun && dispatch({ type: "pick", index: i } as CardSpinPickAction)}
            disabled={isSpun}>
            {isSpun ? cardName(card) : state.playerPick === i ? "★" : "?"}
            <span className="csp-label">{i + 1}</span>
          </button>
        ))}
      </div>
      {!isSpun && (
        <button className="csp-btn spin" disabled={state.playerPick === null} onClick={() => dispatch({ type: "spin" } as CardSpinPickAction)}>Spin!</button>
      )}
      {isSpun && (
        <button className="csp-btn next" onClick={() => dispatch({ type: "next" } as CardSpinPickAction)}>
          {state.round >= state.maxRounds ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}
