import { describe, it, expect } from 'vitest';
import { buildHuCss } from './build-css';

describe('buildHuCss', () => {
  it('interpolates the prefix into class selectors', () => {
    const css = buildHuCss('hu', '#ff0');
    expect(css).toContain('.hu-wrap');
    expect(css).toContain('.hu-title');
    expect(css).toContain('.hu-header');
    expect(css).toContain('.hu-btn');
    expect(css).toContain('.hu-result');
    expect(css).not.toContain('.${prefix}');
  });

  it('interpolates the accent color into themed rules', () => {
    const css = buildHuCss('foo', '#abcdef');
    // accent appears in title color, btn background, result border, etc.
    const matches = css.match(/#abcdef/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
    expect(css).toContain('color:#abcdef');
    expect(css).toContain('background:#abcdef');
    expect(css).toContain('border:2px solid #abcdef');
  });

  it('produces distinct output for different prefixes', () => {
    const a = buildHuCss('alpha', '#111');
    const b = buildHuCss('beta', '#111');
    expect(a).not.toEqual(b);
    expect(a).toContain('.alpha-hand');
    expect(b).toContain('.beta-hand');
    expect(a).not.toContain('.beta-');
    expect(b).not.toContain('.alpha-');
  });
});
