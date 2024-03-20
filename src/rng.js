import { MersenneTwister19937, Random } from 'random-js';

export const rng = new Random(MersenneTwister19937.autoSeed());

export const shuffle = (cards) => {
  return rng.shuffle([...cards]);
};

export const newId = () => rng.uuid4();
