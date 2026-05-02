// Ambient reference so the *.test.tsx files under src/ pick up
// jest-dom's vitest matcher augmentations (toBeInTheDocument,
// toHaveTextContent, etc). The runtime side is wired via test/setup.ts;
// this file only exists for the type-checker.
/// <reference types="@testing-library/jest-dom/vitest" />
