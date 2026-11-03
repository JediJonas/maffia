import { describe, expect, it } from 'vitest';
import { SKIP_VOTE } from './rules.js';
import { tallyVotes } from './voteTally.js';

describe('tallyVotes', () => {
  const order = ['a', 'b', 'c', 'd', 'e'];

  it('visar den som har flest röster först, med väljarna', () => {
    const votes = { a: 'c', b: 'd', e: 'd' };
    expect(tallyVotes(votes, order)).toEqual([
      { targetId: 'd', voterIds: ['b', 'e'] },
      { targetId: 'c', voterIds: ['a'] },
    ]);
  });

  it('tar med röster på den som tittar, så att man ser röster på sig själv', () => {
    expect(tallyVotes({ b: 'a' }, order)).toEqual([{ targetId: 'a', voterIds: ['b'] }]);
  });

  it('lägger avstå sist vid lika', () => {
    const votes = { a: SKIP_VOTE, b: 'c' };
    expect(tallyVotes(votes, order).map((row) => row.targetId)).toEqual(['c', SKIP_VOTE]);
  });

  it('är tom när ingen har röstat', () => {
    expect(tallyVotes({}, order)).toEqual([]);
  });
});
