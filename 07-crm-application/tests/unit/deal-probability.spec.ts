import { DealStage } from '@prisma/client';

describe('CRM Unit Tests - Stage Probability Mapping', () => {
  const STAGE_DEFAULT_PROBABILITIES: Record<DealStage, number> = {
    [DealStage.LEAD]: 10,
    [DealStage.QUALIFIED]: 25,
    [DealStage.PROPOSAL]: 50,
    [DealStage.NEGOTIATION]: 75,
    [DealStage.CLOSED_WON]: 100,
    [DealStage.CLOSED_LOST]: 0,
  };

  it('verifies standard pipeline progression probabilities', () => {
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.LEAD]).toBe(10);
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.QUALIFIED]).toBe(25);
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.PROPOSAL]).toBe(50);
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.NEGOTIATION]).toBe(75);
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.CLOSED_WON]).toBe(100);
    expect(STAGE_DEFAULT_PROBABILITIES[DealStage.CLOSED_LOST]).toBe(0);
  });
});
