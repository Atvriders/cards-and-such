import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItState, SpotItAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItGame({ state, dispatch, onGameOver }: GameProps<SpotItState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const startTimeRef = useRef<number>(Date.now());
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    dispatch({ type: "tick", nowMs: Date.now() } satisfies SpotItAction);
  }, [state.pairsPlayed]);

  useEffect(() => {
    if (terminal) return;
    const id = setInterval(() => {
      dispatch({ type: "tick", nowMs: Date.now() } satisfies SpotItAction);
    }, 200);
    return () => clearInterval(id);
  }, [terminal, dispatch]);

  const match = state.card1.symbols.find(s => state.card2.symbols.includes(s));

  return (
    <div className="spot-it">
      <div className="spot-it-score">
        <span className="spot-it-score-you">You: {state.score}</span>
        <span className="spot-it-score-bot">Bot: {state.botScore}</span>
      </div>
      <div className="spot-it-progress">
        Round {state.pairsPlayed + 1} / {state.totalPairs}
      </div>

      {terminal ? (
        <div className={`spot-it-terminal${state.won ? " spot-it-terminal--won" : " spot-it-terminal--lost"}`}>
          {state.won
            ? `You win! ${state.score} vs ${state.botScore}`
            : `Bot wins! ${state.score} vs ${state.botScore}`}
        </div>
      ) : (
        <>
          <div className="spot-it-cards">
            {[state.card1, state.card2].map((card, ci) => (
              <div key={ci} className="spot-it-card">
                {card.symbols.map((sym, si) => (
                  <span
                    key={si}
                    className={`spot-it-symbol${state.lastMatchSymbol === sym ? " spot-it-symbol--match" : ""}`}
                    onClick={() => {
                      if (!terminal) dispatch({ type: "click", symbol: sym } satisfies SpotItAction);
                    }}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {state.showResult && (
            <div className={`spot-it-result${state.botAnswered ? " spot-it-result--bot" : " spot-it-result--you"}`}>
              {state.botAnswered
                ? `Bot found: ${state.lastMatchSymbol}`
                : `You found: ${state.lastMatchSymbol}`}
            </div>
          )}

          <div className="spot-it-timer">
            Find the symbol that appears on BOTH cards — click it first!
          </div>
        </>
      )}
    </div>
  );
}
