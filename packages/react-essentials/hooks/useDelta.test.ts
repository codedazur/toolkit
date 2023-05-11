import { renderHook } from '@testing-library/react';
import { useDelta } from './useDelta';
import {describe, it, expect} from 'vitest';

describe('useDelta', () => {
  it('should return 0 if there is no previous value', () => {
    const { result } = renderHook(() => useDelta(5));
    expect(result.current).toBe(0);
  });

  it('should return the difference between the current and previous value', () => {
    const { result, rerender } = renderHook(({ value }) => useDelta(value), { initialProps: { value: 5 } });
    expect(result.current).toBe(0);

    rerender({ value: 10 });
    expect(result.current).toBe(5);

    rerender({ value: 7 });
    expect(result.current).toBe(-3);

    rerender({ value: 7 });
    expect(result.current).toBe(0);
  });
});
