import { clamp } from "./clamp";
import {describe, it, expect} from 'vitest';

describe('clamp()', () => {
  it('should return the value when within the range', () => {
    const result = clamp(5, 0, 10);
    expect(result).toEqual(5);
  });

  it('should return the min value when value is less than min', () => {
    const result = clamp(-5, 0, 10);
    expect(result).toEqual(0);
  });

  it('should return the max value when value is greater than max', () => {
    const result = clamp(-10, -25, -5);
    expect(result).toEqual(-10);
  });
  it('should throw an error if min is bigger than max', () => {
    expect(() => clamp(5, 10, 5)).toThrowError("The minimum value must not be larger than the maximum value.")
  });

  it('should throw an error if min is equal to max', () => {
    const result = clamp(5, 10, 10);
    expect(result).toEqual(10);
  });
});
