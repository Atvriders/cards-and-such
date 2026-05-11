import { describe, it, expect } from 'vitest';
import { buildSolitaireFamilyCss } from './solitaire-family-css';

describe('buildSolitaireFamilyCss', () => {
  it('interpolates the prefix into all class selectors', () => {
    const css = buildSolitaireFamilyCss('klon');
    expect(css).toContain('.klon-root');
    expect(css).toContain('.klon-info');
    expect(css).toContain('.klon-auto');
    expect(css).toContain('.klon-top');
    expect(css).toContain('.klon-spacer');
    expect(css).toContain('.klon-tableau');
    expect(css).toContain('.klon-col');
    expect(css).toContain('.klon-stock');
    expect(css).toContain('.klon-waste');
    expect(css).toContain('.klon-foundation');
    expect(css).toContain('.klon-root.has-won');
    expect(css).not.toContain('${prefix}');
  });

  it('uses the default felt color when none is supplied and honors a custom one', () => {
    const def = buildSolitaireFamilyCss('p');
    expect(def).toContain('background: #0d5e3a');

    const custom = buildSolitaireFamilyCss('p', '#123456');
    expect(custom).toContain('background: #123456');
    expect(custom).not.toContain('#0d5e3a');
  });

  it('produces distinct output for different prefixes and keeps shared rules', () => {
    const a = buildSolitaireFamilyCss('alpha');
    const b = buildSolitaireFamilyCss('beta');
    expect(a).not.toEqual(b);
    expect(a).toContain('.alpha-tableau');
    expect(b).toContain('.beta-tableau');
    expect(a).not.toContain('.beta-');
    expect(b).not.toContain('.alpha-');
    // golden-glow rule should be present in both
    expect(a).toContain('inset 0 0 60px gold');
    expect(b).toContain('inset 0 0 60px gold');
  });
});
