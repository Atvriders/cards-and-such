import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  SevenWondersFullState,
  SevenWondersFullAction,
  SevenWondersFullSettings,
  Card,
  PlayerState,
} from "./state.js";
import {
  isTerminal,
  WONDERS,
  canAfford,
  canBuildWonderStage,
  computeFinalScore,
  tradeCost,
} from "./state.js";
import "./Game.css";

type Choice = "play" | "wonder" | "discard";

const COLOR_TO_LABEL: Record<string, string> = {
  brown: "Resource",
  grey: "Goods",
  yellow: "Commerce",
  red: "Military",
  blue: "Civic",
  green: "Science",
  purple: "Guild",
};

function CardView({
  card,
  idx,
  selected,
  affordable,
  onClick,
}: {
  card: Card;
  idx: number;
  selected: boolean;
  affordable: boolean;
  onClick: () => void;
}): JSX.Element {
  const classes = ["swf-card", `swf-card--${card.color}`];
  if (selected) classes.push("swf-card--selected");
  if (!affordable) classes.push("swf-card--unaffordable");
  return (
    <button
      type="button"
      className={classes.join(" ")}
      data-testid={`swf-card-${idx}`}
      onClick={onClick}
      title={`${card.name} — ${COLOR_TO_LABEL[card.color] ?? card.color} card. Cost: ${card.cost}`}
    >
      <div className="swf-card__name">{card.name}</div>
      <div className="swf-card__tag">{COLOR_TO_LABEL[card.color] ?? card.color}</div>
      <div className="swf-card__stats">
        {card.cost > 0 ? <span>Cost {card.cost}</span> : <span>Free</span>}
        {card.vp > 0 ? <span>+{card.vp} VP</span> : null}
        {card.shields > 0 ? <span>{card.shields}🛡</span> : null}
        {card.coins > 0 ? <span>+{card.coins}¢</span> : null}
        {card.produces > 0 ? <span>+{card.produces} prod</span> : null}
        {card.science ? <span>{card.science}</span> : null}
      </div>
    </button>
  );
}

function TableauStrip({ player }: { player: PlayerState }): JSX.Element {
  const counts: Record<string, number> = {};
  for (const c of player.tableau) counts[c.color] = (counts[c.color] ?? 0) + 1;
  return (
    <div className="swf-tableau" data-testid={`swf-tableau-${player.seat}`}>
      {(["brown", "grey", "yellow", "red", "blue", "green", "purple"] as const).map((color) => (
        <span key={color} className={`swf-pip swf-pip--${color}`} title={`${COLOR_TO_LABEL[color]} cards`}>
          {counts[color] ?? 0}
        </span>
      ))}
    </div>
  );
}

function OpponentBox({ player }: { player: PlayerState }): JSX.Element {
  const wonder = WONDERS[player.wonderIdx];
  return (
    <div className="swf-opp" data-testid={`swf-opp-${player.seat}`}>
      <div className="swf-opp__header">
        <span className="swf-opp__name">{player.name}</span>
        <span className="swf-opp__wonder">{wonder?.name ?? "?"}</span>
      </div>
      <div className="swf-opp__meta">
        <span title="Coins">{player.coins}¢</span>
        <span title="Shields">{player.shields}🛡</span>
        <span title="Wonder stages built">⛩ {player.stagesBuilt}/{wonder?.stages.length ?? 0}</span>
        <span title="Cards built">📜 {player.tableau.length}</span>
      </div>
      <TableauStrip player={player} />
    </div>
  );
}

export function SevenWondersFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SevenWondersFullState, SevenWondersFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-progress the military/scoring phases after a short delay so the
  // human can read the log lines.
  useEffect(() => {
    if (state.phase === "military") {
      const t = window.setTimeout(() => {
        dispatch({ type: "resolveMilitary" } satisfies SevenWondersFullAction);
      }, 900);
      return () => window.clearTimeout(t);
    }
    if (state.phase === "scoring") {
      const t = window.setTimeout(() => {
        dispatch({ type: "score" } satisfies SevenWondersFullAction);
      }, 1200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [state.phase, dispatch]);

  const human = state.players[0];
  const opponents = state.players.slice(1);
  const wonder = human ? WONDERS[human.wonderIdx] : undefined;
  const nextStage = wonder && human && human.stagesBuilt < wonder.stages.length
    ? wonder.stages[human.stagesBuilt]
    : null;

  const [choice, setChoice] = useState<Choice>("play");

  const selectedIdx = human?.pendingCardIdx ?? -1;
  const selectedAction = human?.pendingAction ?? null;

  const canCommit = selectedIdx >= 0 && selectedAction !== null;

  const liveProjections = useMemo(() => {
    if (!human) return null;
    return state.players.map(computeFinalScore);
  }, [state.players, human]);

  function handleCardClick(idx: number) {
    if (!human || state.phase !== "playing") return;
    const card = human.hand[idx];
    if (!card) return;
    let act: Choice = choice;
    // Validate: if the chosen action isn't legal for this card, fall back.
    if (act === "play" && !canAfford(human, card.cost)) act = "discard";
    if (act === "wonder" && (!wonder || !canBuildWonderStage(human, wonder))) act = "discard";
    dispatch({ type: "selectCard", cardIdx: idx, action: act } satisfies SevenWondersFullAction);
  }

  function handleCommit() {
    dispatch({ type: "resolveRound" } satisfies SevenWondersFullAction);
  }

  function renderHand() {
    if (!human) return null;
    return (
      <div className="swf-hand">
        {human.hand.map((c, i) => (
          <CardView
            key={c.id + "-" + i}
            card={c}
            idx={i}
            selected={selectedIdx === i}
            affordable={canAfford(human, c.cost)}
            onClick={() => handleCardClick(i)}
          />
        ))}
      </div>
    );
  }

  function renderActionBar() {
    if (!human) return null;
    const selectedCard = selectedIdx >= 0 ? human.hand[selectedIdx] : null;
    return (
      <div className="swf-actions">
        <div className="swf-actions__group" role="radiogroup" aria-label="Choose how to use the selected card">
          <button
            type="button"
            className={`swf-actbtn ${choice === "play" ? "swf-actbtn--on" : ""}`}
            onClick={() => setChoice("play")}
            title="Build the selected card into your tableau"
            data-testid="swf-mode-play"
            aria-pressed={choice === "play"}
          >
            Build Card
          </button>
          <button
            type="button"
            className={`swf-actbtn ${choice === "wonder" ? "swf-actbtn--on" : ""}`}
            onClick={() => setChoice("wonder")}
            title="Use the selected card to construct the next wonder stage"
            data-testid="swf-mode-wonder"
            aria-pressed={choice === "wonder"}
            disabled={!nextStage || !wonder || !canBuildWonderStage(human, wonder)}
          >
            Build Wonder
          </button>
          <button
            type="button"
            className={`swf-actbtn ${choice === "discard" ? "swf-actbtn--on" : ""}`}
            onClick={() => setChoice("discard")}
            title="Discard the selected card for 3 coins"
            data-testid="swf-mode-discard"
            aria-pressed={choice === "discard"}
          >
            Discard (+3¢)
          </button>
        </div>
        <button
          type="button"
          className="game-button game-button--primary"
          disabled={!canCommit}
          onClick={handleCommit}
          title="Commit your choice — CPUs will draft simultaneously"
          data-testid="swf-commit"
        >
          {canCommit ? `Confirm (${selectedAction})` : "Pick a card first"}
        </button>
        {selectedCard ? (
          <div className="swf-actions__cost">
            {selectedAction === "play"
              ? `Trade cost: ${tradeCost(human, selectedCard.cost)}¢`
              : selectedAction === "wonder" && nextStage
                ? `Wonder stage cost: ${nextStage.cost} (trade ${tradeCost(human, nextStage.cost)}¢)`
                : ""}
          </div>
        ) : null}
      </div>
    );
  }

  function renderHeader() {
    return (
      <div className="game-info swf-header">
        <span className="game-badge" data-testid="swf-age">
          Age {state.age === 1 ? "I" : state.age === 2 ? "II" : "III"} — Round {state.round}/7
        </span>
        <span className="game-badge swf-badge-phase pulse" data-testid="swf-phase">
          {state.phase}
        </span>
        {human ? (
          <span className="game-badge" data-testid="swf-human-coins">
            You: {human.coins}¢ · {human.shields}🛡 · score {liveProjections?.[0] ?? 0}
          </span>
        ) : null}
      </div>
    );
  }

  function renderLog() {
    return (
      <div className="swf-log" data-testid="swf-log" aria-live="polite">
        {state.log.slice(-6).map((line, i) => (
          <div key={i} className="swf-log__line">{line}</div>
        ))}
      </div>
    );
  }

  function renderScoring() {
    if (state.phase !== "scoring" && state.phase !== "done") return null;
    return (
      <div className="swf-final bounce-in" data-testid="swf-final">
        <h3>Final Scores</h3>
        <table>
          <thead>
            <tr><th>Player</th><th>Wonder</th><th>VP</th></tr>
          </thead>
          <tbody>
            {state.players.map((p) => (
              <tr key={p.seat} className={p.seat === 0 ? "swf-final__me" : undefined}>
                <td>{p.name}</td>
                <td>{WONDERS[p.wonderIdx]?.name ?? "?"}</td>
                <td>{state.finalScore[p.seat] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="game-button game-button--primary"
          onClick={() => dispatch({ type: "score" } satisfies SevenWondersFullAction)}
          title="Finish the game"
          data-testid="swf-acknowledge-final"
        >
          Acknowledge
        </button>
      </div>
    );
  }

  return (
    <div className="game-shell swf-shell fade-in">
      {renderHeader()}
      <div className="swf-opps">
        {opponents.map((p) => <OpponentBox key={p.seat} player={p} />)}
      </div>
      {human ? (
        <div className="swf-me">
          <div className="swf-me__header">
            <strong>{human.name}</strong>
            <span>{wonder?.name ?? "?"} — stage {human.stagesBuilt}/{wonder?.stages.length ?? 0}</span>
            <span>{human.coins}¢ · {human.shields}🛡</span>
          </div>
          <TableauStrip player={human} />
          {state.phase === "playing" ? (
            <>
              <h4>Your hand ({human.hand.length})</h4>
              {renderHand()}
              {renderActionBar()}
            </>
          ) : null}
        </div>
      ) : null}
      {state.phase === "military" ? (
        <button
          type="button"
          className="game-button game-button--secondary swf-resolve-mil"
          onClick={() => dispatch({ type: "resolveMilitary" } satisfies SevenWondersFullAction)}
          title="Resolve military combat for this age"
          data-testid="swf-resolve-military"
        >
          Resolve Military
        </button>
      ) : null}
      {renderLog()}
      {renderScoring()}
    </div>
  );
}
