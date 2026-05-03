# Security Policy

## Supported versions

This project ships from `master`. Only the latest tag and the current
`master` commit receive security fixes. Older Docker image tags
(`ghcr.io/atvriders/cards-and-such-*`) are not patched retroactively;
pull `:latest` or rebuild from `master` to pick up fixes.

## Reporting a vulnerability

Please do **not** file a public GitHub issue for security problems.
Instead, email **klassenjames0@gmail.com** with:

- A description of the issue and its impact.
- Steps to reproduce (a minimal repro is hugely helpful).
- The commit SHA or image tag you found it on.
- Whether you have already published or shared the finding anywhere.

You can expect:

- An acknowledgement within **3 business days**.
- A triage response (accepted / not-a-vuln / needs-more-info) within
  **7 days** of acknowledgement.
- A fix or mitigation within **30 days** for accepted reports, sooner
  for anything actively exploitable.

If you don't get a reply within a week, feel free to ping the maintainer
on the same email — mail filters happen.

## Scope

In scope:

- The web SPA (`web/`) — XSS, auth bypass, CSRF, prototype pollution,
  data leaks via the leaderboard or replay APIs.
- The Fastify server (`server/`) — auth bypass, JWT issues, SQL
  injection (we use parameterised `better-sqlite3`), WebSocket abuse,
  rate-limit bypass.
- Shared multiplayer reducers (`shared/`) — desync exploits, action
  validation gaps that let a malicious peer corrupt server state.
- The Docker images we publish (`ghcr.io/atvriders/cards-and-such-web`,
  `…-server`).

Out of scope:

- Denial of service from a single client (we have rate limits but no
  formal DoS guarantee).
- Issues that require physical access to the user's device.
- Self-XSS (e.g. pasting JS into the dev console).
- Vulnerabilities in third-party dependencies that have no working
  exploit against this codebase — please report those upstream.
- Username squatting on the public demo at <https://cards.waterburp.com>.

## Disclosure

We prefer **coordinated disclosure**: report privately, give us a
reasonable window to ship a fix, then we credit you (with your
permission) in the release notes and `CHANGELOG.md`.
