import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  WingspanFullState,
  WingspanFullAction,
  WingspanFullSettings,
  PlayedBird,
  Habitat,
  PlayerState,
  BonusTileKind,
} from "./state.js";
import {
  isTerminal,
  scorePlayer,
  getBird,
  ACTIONS_PER_ROUND,
  ROUNDS,
  HABITAT_SLOTS,
  BONUS_TILES,
} from "./state.js";
import "./Game.css";

function HabitatRow({
  label,
  emoji,
  habitat,
  birds,
  isHuman,
  canActivate,
  onActivate,
}: {
  label: string;
  emoji: string;
  habitat: Habitat;
  birds: PlayedBird[];
  isHuman: boolean;
  canActivate: boolean;
  onActivate: () => void;
}): JSX.Element {
  return (
    <div className={`wf-row wf-row--${habitat}`}>
      <div className="wf-row-head">
        <span className="wf-row-emoji" aria-hidden="true">{emoji}</span>
        <span className="wf-row-label">{label}</span>
        <span className="wf-row-count">{birds.length} / {HABITAT_SLOTS}</span>
        {isHuman && (
          <button
            className="wf-btn wf-btn--small"
            disabled={!canActivate}
            onClick={onActivate}
            data-testid={`wingspan-full-use-${habitat}`}
            title={`Activate ${label} row to ${habitat === "forest" ? "gain food" : habitat === "grassland" ? "lay eggs" : "draw cards"}`}
          >
            Use
          </button>
        )}
      </div>
      <div className="wf-slots">
        {Array.from({ length: HABITAT_SLOTS }).map((_, i) => {
          const b = birds[i];
          if (!b) {
            return <div key={i} className="wf-slot wf-slot--empty" aria-hidden="true">·</div>;
          }
          const card = getBird(b.cardId);
          if (!card) return <div key={i} className="wf-slot wf-slot--empty" />;
          return (
            <div key={i} className="wf-slot wf-slot--filled">
              <div className="wf-bird-name">{card.name}</div>
              <div className="wf-bird-meta">
                <span title="Victory points">{card.vp}vp</span>
                <span title="Eggs / capacity">🥚{b.eggs}/{card.eggCapacity}</span>
                {b.cached > 0 && <span title="Cached food">🍇{b.cached}</span>}
                {b.tucked > 0 && <span title="Tucked birds">📚{b.tucked}</span>}
              </div>
              <div className="wf-bird-power" title={`Power: ${card.power.replace(/_/g, " ")}`}>{card.power.replace(/_/g, " ")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function bonusLabel(kind: BonusTileKind): string {
  return BONUS_TILES.find((t) => t.kind === kind)?.label ?? kind;
}

function CpuMini({ p, seat }: { p: PlayerState; seat: number }): JSX.Element {
  return (
    <div className="wf-cpu">
      <div className="wf-cpu-head">
        <strong>CPU {seat}</strong>
        <span className="wf-cpu-score">{scorePlayer(p)} VP</span>
      </div>
      <div className="wf-cpu-stats">
        <span title="Food">🍖 {p.food}</span>
        <span title="Cards in hand">🂠 {p.hand.length}</span>
        <span title="Forest birds">🌲 {p.forest.length}</span>
        <span title="Grassland birds">🌾 {p.grassland.length}</span>
        <span title="Wetland birds">💧 {p.wetland.length}</span>
      </div>
    </div>
  );
}

export function WingspanFullGame({ state, dispatch, onGameOver }: GameProps<WingspanFullState, WingspanFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-step CPU turns with a short delay for readability.
  useEffect(() => {
    if (state.phase !== "playing") return;
    const seat = state.current;
    const cur = state.players[seat];
    if (!cur || !cur.isCPU) return;
    const t = window.setTimeout(() => {
      dispatch({ type: "cpu_step" } as WingspanFullAction);
    }, 380);
    return () => window.clearTimeout(t);
  }, [state, dispatch]);

  const human = state.players[0] as PlayerState;
  const term = isTerminal(state);

  if (state.phase === "game_over") {
    const finalHuman = scorePlayer(human);
    const rivals = state.players.slice(1).map((p, i) => ({ i: i + 1, score: scorePlayer(p) }));
    const winner = term && term.score > 0 ? "You win!" : "CPU wins.";
    return (
      <div className="wf-wrap fade-in">
        <div className="wf-done bounce-in">
          <h2>🐦 Wingspan — Final</h2>
          <div className="wf-final pulse">{finalHuman} VP</div>
          <div className="wf-final-note">{winner}</div>
          <ul className="wf-final-list">
            <li>You: <strong>{finalHuman}</strong> VP</li>
            {rivals.map((r) => (
              <li key={r.i}>CPU {r.i}: <strong>{r.score}</strong> VP</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const currentSeat = state.current;
  const isHumanTurn = currentSeat === 0 && state.phase === "playing";
  const actionsLeft = state.actionsLeft[currentSeat] ?? 0;

  return (
    <div className="wf-wrap fade-in">
      <div className="wf-topbar">
        <div className="wf-info">
          <div>Round {state.round + 1} / {ROUNDS} · {ACTIONS_PER_ROUND[state.round]} actions</div>
          <div className="wf-bonus">Round bonus: {bonusLabel(state.bonusTiles[state.round] ?? "most_eggs")}</div>
        </div>
        <div className="wf-score pulse" title="Your current VP">{scorePlayer(human)} VP</div>
      </div>

      <div className="wf-status">
        <span>{isHumanTurn ? "Your turn" : `CPU ${currentSeat}'s turn`}</span>
        <span className="wf-actions">Actions left: {actionsLeft}</span>
        {state.lastLog && <span className="wf-log">{state.lastLog}</span>}
      </div>

      {state.phase === "round_end" && (
        <div className="wf-round-end bounce-in">
          <h3>Round {state.round + 1} complete</h3>
          <p>{state.lastLog}</p>
          <button
            className="wf-btn"
            data-testid="wingspan-full-advance"
            onClick={() => dispatch({ type: "advance_round" } as WingspanFullAction)}
          >
            Begin Round {Math.min(state.round + 2, ROUNDS)}
          </button>
        </div>
      )}

      <div className="wf-board">
        <HabitatRow
          label="Forest"
          emoji="🌲"
          habitat="forest"
          birds={human.forest}
          isHuman
          canActivate={isHumanTurn && actionsLeft > 0}
          onActivate={() => dispatch({ type: "use_habitat", habitat: "forest" } as WingspanFullAction)}
        />
        <HabitatRow
          label="Grassland"
          emoji="🌾"
          habitat="grassland"
          birds={human.grassland}
          isHuman
          canActivate={isHumanTurn && actionsLeft > 0}
          onActivate={() => dispatch({ type: "use_habitat", habitat: "grassland" } as WingspanFullAction)}
        />
        <HabitatRow
          label="Wetland"
          emoji="💧"
          habitat="wetland"
          birds={human.wetland}
          isHuman
          canActivate={isHumanTurn && actionsLeft > 0}
          onActivate={() => dispatch({ type: "use_habitat", habitat: "wetland" } as WingspanFullAction)}
        />
      </div>

      <div className="wf-bar">
        <div className="wf-resource" title="Food in your supply (generic)">
          🍖 Food <strong>{human.food}</strong>
        </div>
        <div className="wf-resource" title="Cards in your hand">
          🂠 Hand <strong>{human.hand.length}</strong>
        </div>
        <div className="wf-resource" title="Birds remaining in deck">
          🐦 Deck <strong>{state.deck.length}</strong>
        </div>
        <div className="wf-resource" title="Personal bonus card target">
          ⭐ Bonus <strong>{bonusLabel(human.bonusCard)}</strong>
        </div>
      </div>

      <div className="wf-hand">
        <div className="wf-hand-head">Your hand</div>
        <div className="wf-hand-cards">
          {human.hand.length === 0 && <div className="wf-empty">No cards in hand. Activate the Wetland to draw.</div>}
          {human.hand.map((id, idx) => {
            const card = getBird(id);
            if (!card) return null;
            const row =
              card.habitat === "forest" ? human.forest :
              card.habitat === "grassland" ? human.grassland : human.wetland;
            const canPlay = isHumanTurn && actionsLeft > 0 && card.cost <= human.food && row.length < HABITAT_SLOTS;
            return (
              <button
                key={`${id}-${idx}`}
                className={`wf-card wf-card--${card.habitat} ${canPlay ? "" : "wf-card--disabled"}`}
                disabled={!canPlay}
                onClick={() => dispatch({ type: "play_bird", cardId: id, habitat: card.habitat } as WingspanFullAction)}
                data-testid={`wingspan-full-play-${id}`}
                title={`Play ${card.name} into ${card.habitat} (cost ${card.cost} food, ${card.vp} VP, power: ${card.power.replace(/_/g, " ")})`}
              >
                <div className="wf-card-name">{card.name}</div>
                <div className="wf-card-line">
                  <span className="wf-card-cost">🍖 {card.cost}</span>
                  <span className="wf-card-vp">{card.vp}vp</span>
                </div>
                <div className="wf-card-meta">
                  <span title="Habitat">{card.habitat}</span>
                  <span title="Egg capacity">🥚{card.eggCapacity}</span>
                </div>
                <div className="wf-card-power">{card.power.replace(/_/g, " ")}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wf-cpus">
        {state.players.slice(1).map((p, i) => (
          <CpuMini key={i + 1} p={p as PlayerState} seat={i + 1} />
        ))}
      </div>

      {!isHumanTurn && state.phase === "playing" && (
        <button
          className="wf-btn wf-btn--ghost"
          data-testid="wingspan-full-cpu-tick"
          onClick={() => dispatch({ type: "cpu_step" } as WingspanFullAction)}
          title="Advance the CPU's turn manually"
        >
          Advance CPU
        </button>
      )}
    </div>
  );
}
