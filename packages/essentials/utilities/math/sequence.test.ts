import { sequence } from "./sequence";
import {describe, it, expect} from 'vitest';


describe('sequence', () => {

  it('generates an array starting at 0 and ending at 5', () => {
    expect(sequence(0, 5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('generates an array starting at 5 and ending at 0', () => {
    expect(sequence(5, 0)).toEqual([5, 4, 3, 2, 1, 0]);
  });

  it('generates an array starting at -3 and ending at 3', () => {
    expect(sequence(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
  });

  it('generates an array starting at 3 and ending at -3', () => {
    expect(sequence(3, -3)).toEqual([3, 2, 1, 0, -1, -2, -3]);
  });

  it('generates an array with only one number if start and end are the same', () => {
    expect(sequence(10, 10)).toEqual([10]);
  });
});
