import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AgricolaState, AgricolaSettings, AgricolaAction, ActionId } from "./state.js";
import {
  isTerminal,
  ACTION_SPACES,
  HARVEST_ROUNDS,
  TOTAL_ROUNDS,
  seatLabel,
  scorePlayer,
} from "./state.js";
import "./Game.css";

const HUT_LABEL: Record<string, string> = {
  wood: "Wooden Hut",
  clay: "Clay Hut",
  stone: "Stone Hut",
};

export function AgricolaGame({ state, dispatch, onGameOver }: GameProps<AgricolaState, AgricolaSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-run CPU turns. Each scheduled via setTimeout so the user sees progression.
  useEffect(() => {
    if (state.phase !== "placement") return;
    const current = state.players[state.currentSeat];
    if (!current || current.isHuman) return;
    if (current.workersAvailable <= 0) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } as AgricolaAction);
    }, 400);
    return () => window.clearTimeout(id);
  }, [state, dispatch]);

  const term = isTerminal(state);
  const you = state.players[0];

  if (term) {
    return (
      <div className="ag-wrap fade-in">
        <div className="ag-done bounce-in">
          <h2>{state.winner === 0 ? "You win!" : `${seatLabel(state.winner ?? 0)} wins!`}</h2>
          <div className="ag-final-score pulse">Your score: {term.score}</div>
          <div className="ag-scoreboard">
            {state.players.map((p, i) => {
              const sp = scorePlayer(p);
              return (
                <div key={i} className={`ag-score-row ${i === state.winner ? "winner" : ""}`}>
                  <strong>{seatLabel(p.seat)}</strong>
                  <span className="ag-score-total">{state.finalScores[i]} VP</span>
                  <div className="ag-score-breakdown">{sp.lines.join(" | ")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const isYourTurn = state.phase === "placement" && state.currentSeat === 0 && you && you.workersAvailable > 0;
  const isHarvestRound = HARVEST_ROUNDS.includes(state.round);

  const onPlace = (id: ActionId) => {
    if (!isYourTurn) return;
    dispatch({ type: "place", actionId: id } as AgricolaAction);
  };

  return (
    <div className="ag-wrap fade-in">
      <header className="ag-header">
        <div className="ag-round">
          Round <strong>{state.round}</strong> / {TOTAL_ROUNDS}
          {isHarvestRound && <span className="ag-harvest-tag" title="Harvest at end of this round">HARVEST</span>}
        </div>
        <div className="ag-turn pulse">
          {state.phase === "placement"
            ? (isYourTurn ? "Your turn — place a worker" : `${seatLabel(state.currentSeat)} thinking…`)
            : state.phase === "feeding"
              ? "Harvest! Feed family and breed animals."
              : ""}
        </div>
      </header>

      <section className="ag-players">
        {state.players.map((p) => {
          const isCur = p.seat === state.currentSeat && state.phase === "placement";
          return (
            <div key={p.seat} className={`ag-player ${p.seat === 0 ? "you" : ""} ${isCur ? "active" : ""}`}>
              <div className="ag-player-head">
                <strong>{seatLabel(p.seat)}</strong>
                <span className="ag-workers" title="Available workers / total family">
                  Workers: {p.workersAvailable}/{p.totalWorkers}
                </span>
                {p.seat === state.startingPlayer && <span className="ag-sp-badge" title="Starting player">SP</span>}
              </div>
              <div className="ag-stats">
                <span title="Hut type and rooms">{HUT_LABEL[p.hut]} x{p.rooms}</span>
                <span title="Food in stockpile">Food {p.food}</span>
                <span title="Wood">W{p.wood}</span>
                <span title="Clay">C{p.clay}</span>
                <span title="Stone">St{p.stone}</span>
                <span title="Reed">R{p.reed}</span>
                <span title="Grain held + on fields">G{p.grain}+{p.grainOnFields}</span>
                <span title="Vegetables">V{p.vegetable}</span>
                <span title="Fields sown">Fields {p.fields}</span>
                <span title="Pasture capacity">Pasture {p.pastureCapacity}</span>
                <span title="Sheep">Sh{p.sheep}</span>
                <span title="Boar">B{p.boar}</span>
                <span title="Cattle">Ca{p.cattle}</span>
                {p.begCards > 0 && <span className="ag-beg" title="Begging cards (-3 VP each)">Beg {p.begCards}</span>}
              </div>
            </div>
          );
        })}
      </section>

      <section className="ag-board">
        <h3>Action Spaces</h3>
        <div className="ag-actions">
          {ACTION_SPACES.map((sp) => {
            const unlocked = state.unlocked.includes(sp.id);
            const occupier = state.occupied[sp.id];
            const taken = occupier !== undefined;
            const youCanPlace = isYourTurn && unlocked && !taken;
            return (
              <button
                key={sp.id}
                data-testid={`agricola-action-${sp.id}`}
                className={`ag-action ${unlocked ? "" : "locked"} ${taken ? "taken" : ""} ${youCanPlace ? "available" : ""}`}
                disabled={!youCanPlace}
                title={sp.description}
                aria-label={sp.label}
                onClick={() => onPlace(sp.id)}
              >
                <span className="ag-action-label">{sp.label}</span>
                {!unlocked && <span className="ag-action-locked" title="Not yet revealed">locked</span>}
                {taken && occupier !== undefined && (
                  <span className="ag-action-worker" title={`Occupied by ${seatLabel(occupier)}`}>
                    {seatLabel(occupier)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {state.phase === "feeding" && (
        <section className="ag-feeding bounce-in">
          <h3>Harvest Resolved</h3>
          <p>Fields yielded grain, families were fed, and animals bred.</p>
          <button
            data-testid="agricola-ack-harvest"
            className="ag-btn primary"
            title="Continue to next round"
            onClick={() => dispatch({ type: "ackHarvest" } as AgricolaAction)}
          >
            Continue
          </button>
        </section>
      )}

      <section className="ag-log" aria-label="Game log">
        <h4>Log</h4>
        <ol>
          {state.log.slice(-10).map((entry, i) => (
            <li key={`${state.log.length - 10 + i}-${entry}`}>{entry}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
