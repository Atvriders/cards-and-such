import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiaState, MiaAction, MiaSettings, MiaRoll } from "./state.js";
import { rollLabel, rollRank, isTerminal, startNextRound, ALL_MIA_CLAIMS } from "./state.js";
import "./Mia.css";

export function Mia({
  state,
  dispatch,
  onGameOver,
}: GameProps<MiaState, MiaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedClaim, setSelectedClaim] = useState<MiaRoll | null>(null);
  const [localState, setLocalState] = useState(state);

  useEffect(() => { setLocalState(state); }, [state]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Auto-trigger bot decision
  useEffect(() => {
    if (localState.phase === "botDecision") {
      const timer = setTimeout(() => {
        dispatch({ type: "botDecide" } as MiaAction);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [localState.phase, dispatch]);

  function handleRoll() {
    dispatch({ type: "roll" } as MiaAction);
  }

  function handleDeclare() {
    if (!selectedClaim) return;
    dispatch({ type: "declare", claim: selectedClaim } as MiaAction);
  }

  function handleNextRound() {
    // startNextRound returns new state but since we use dispatch pattern,
    // we fake it by dispatching a no-op and using local reset
    // Instead we provide a dedicated action via a workaround: pass through reducer
    setLocalState((prev) => startNextRound(prev));
    // Also signal via a roll action cleared
    dispatch({ type: "roll" } as MiaAction); // Will be ignored if phase != playerRoll
    setSelectedClaim(null);
  }

  const playerLivesArr = Array.from({ length: state.playerLives }, (_, i) => i);
  const botLivesArr = Array.from({ length: state.botLives }, (_, i) => i);

  return (
    <div className="mia">
      <h2>Round {state.round}</h2>

      <div className="mia-lives">
        <div>
          <span>You: </span>
          {playerLivesArr.map((i) => <span key={i} className="life">♥</span>)}
          {Array.from({ length: (state.settings.startingLives === "5" ? 5 : 3) - state.playerLives }).map((_, i) => (
            <span key={"lost" + i} className="life lost">♡</span>
          ))}
        </div>
        <div>
          <span>Bot: </span>
          {botLivesArr.map((i) => <span key={i} className="life">♥</span>)}
          {Array.from({ length: (state.settings.startingLives === "5" ? 5 : 3) - state.botLives }).map((_, i) => (
            <span key={"blost" + i} className="life lost">♡</span>
          ))}
        </div>
      </div>

      <div className="mia-message">{state.message}</div>

      {state.phase === "playerRoll" && !state.winner && (
        <button className="mia-btn" onClick={handleRoll}>Roll Dice (Secret)</button>
      )}

      {state.phase === "playerDeclare" && state.playerRoll && (
        <div className="mia-declare">
          <div className="mia-actual">Your actual roll: <strong>{rollLabel(state.playerRoll)}</strong></div>
          <label>Declare as:</label>
          <select
            value={selectedClaim ? rollLabel(selectedClaim) : ""}
            onChange={(e) => {
              const found = ALL_MIA_CLAIMS.find((r) => rollLabel(r) === e.target.value);
              setSelectedClaim(found ?? null);
            }}
          >
            <option value="">-- pick a claim --</option>
            {ALL_MIA_CLAIMS.map((r) => (
              <option key={rollLabel(r)} value={rollLabel(r)}>
                {rollLabel(r)} {rollRank(r) >= rollRank(state.playerRoll!) ? "" : "(bluff)"}
              </option>
            ))}
          </select>
          <button className="mia-btn" onClick={handleDeclare} disabled={!selectedClaim}>
            Declare!
          </button>
        </div>
      )}

      {state.phase === "botDecision" && (
        <div className="mia-waiting">Bot is thinking...</div>
      )}

      {state.phase === "reveal" && (
        <button className="mia-btn" onClick={handleNextRound}>Next Round</button>
      )}

      {state.winner && (
        <div className={`mia-game-over ${state.winner === "player" ? "win" : "loss"}`}>
          {state.winner === "player" ? "You win! Bot is out of lives." : "You lose! No lives left."}
        </div>
      )}
    </div>
  );
}
