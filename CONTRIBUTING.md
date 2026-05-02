# Contributing to cards-and-such

Thanks for the interest. The bar to merge is low and mechanical:

1. **Branch off `master`.** Small, focused PRs are easier to review.
2. **Run the gates locally:**
   ```bash
   npm install
   npm run typecheck
   npm test
   npm run build
   ```
   All four must pass. CI runs the same set on every push.
3. **New games go in their own folder** under `web/src/games/<id>/`. Follow
   the five-step recipe in the top-level `README.md`. State logic must live in
   a pure reducer with `state.test.ts` next to it — no DOM, no `Date.now()`,
   no `Math.random()` outside the seeded RNG.
4. **Multiplayer changes:** if you touch a `shared/` reducer, both client and
   server pick it up automatically. Add tests in `shared/` for any new action.
5. **Don't commit secrets, build output, or `node_modules`.**

Open the PR against `master`. A maintainer (or CI) will tell you what's left.
