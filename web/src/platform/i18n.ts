/**
 * Tiny string-registry "i18n" — just a flat key→string map plus a `t()`
 * lookup. We deliberately keep it dumb (no interpolation, no plural rules,
 * no async loading) because today the app ships exactly one locale and the
 * goal of this module is to give us a single seam to swap in something
 * larger (lingui, i18next, format.js, …) without a 200-file refactor.
 *
 * Future locales would just add another registry — e.g.
 *   const ES: Registry = { "nav.lobby": "Lobby", "hud.score": "Puntuación", … };
 *   const FR: Registry = { "nav.lobby": "Hall",  "hud.score": "Score",      … };
 * and the `t()` function would dispatch on the active LANG. For now LANG
 * is hard-coded to "en"; once a real language toggle exists, swap this
 * for a runtime lookup driven by user preference / browser locale.
 */

type Registry = Record<string, string>;

/**
 * Active language. Hard-coded for now — the registry below is the only
 * one defined. To add Spanish/French/etc. later, declare another const
 * (e.g. `const ES: Registry = {…}`), wire a `REGISTRIES` lookup keyed by
 * lang, and let `LANG` come from a user setting / `navigator.language`.
 */
export const LANG = "en" as const;

const EN: Registry = {
  // Top-nav + header chrome
  "nav.lobby": "Lobby",
  "nav.daily": "Daily",
  "nav.leaderboard": "Leaderboard",
  "nav.whats_new": "What's New",
  "nav.sign_out": "Sign out",

  // Lobby chips / category labels
  "lobby.chip.all": "All",
  "lobby.chip.top_rated": "Top Rated",
  "lobby.cat.solitaire": "Solitaire",
  "lobby.cat.cards": "Cards",
  "lobby.cat.dice": "Dice",
  "lobby.cat.board": "Board",
  "lobby.cat.arcade": "Arcade",
  "lobby.empty.no_games": "No games installed yet.",
  "lobby.empty.top_rated": "You haven't rated any games highly enough yet. Play a game and tap the stars at the end to fill this list.",
  "lobby.clear_filters": "Clear filters",

  // PlayPage HUD / end screen
  "hud.score": "Score",
  "hud.moves": "Moves",
  "hud.time": "Time",
  "hud.best": "best",
  "hud.game_over": "Game over",
  "hud.new_game": "New Game",
  "hud.replay": "Replay",

  // Theme picker
  "theme.label": "Theme",
  "theme.background": "Background",

  // Settings page
  "settings.title": "Settings",
  "settings.section.background": "Background theme",
  "settings.section.card_back": "Card-back style",
  "settings.section.sound": "Sound",
  "settings.section.animations": "Animations",
  "settings.section.card_font": "Card font",
  "settings.sound.on": "Sound on",
  "settings.sound.off": "Sound off",
  "settings.reset": "Reset all preferences",
};

const REGISTRY: Registry = EN;

/**
 * Look up a translation by key. Unknown keys return the key itself —
 * makes missing-translation bugs visible in the UI without crashing,
 * and works as a no-op fallback during incremental rollout.
 */
export function t(key: string): string {
  return REGISTRY[key] ?? key;
}
