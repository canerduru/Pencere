import { CALM_SESSION } from '../calmSession';

describe('CALM_SESSION', () => {
  it('7 adım içerir', () => {
    expect(CALM_SESSION.steps).toHaveLength(7);
  });

  it('her adımın pozitif süresi ve boş olmayan metni vardır', () => {
    for (const step of CALM_SESSION.steps) {
      expect(step.durationMs).toBeGreaterThan(0);
      expect(step.text.trim().length).toBeGreaterThan(0);
      expect(step.id.trim().length).toBeGreaterThan(0);
    }
  });

  it('adım kimlikleri benzersizdir', () => {
    const ids = CALM_SESSION.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('beklenen sıraya sahiptir', () => {
    expect(CALM_SESSION.steps.map((s) => s.kind)).toEqual([
      'settle',
      'notice',
      'senses',
      'senses',
      'senses',
      'breath',
      'closing',
    ]);
  });
});
