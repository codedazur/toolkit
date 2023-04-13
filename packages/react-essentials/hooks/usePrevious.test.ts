import { renderHook, act } from '@testing-library/react';
import { usePrevious } from './usePrevious';
import {describe, it, expect} from 'vitest';

describe('usePrevious', () => {
  it('should return undefined for the first render', () => {
    const { result } = renderHook(() => usePrevious(0));

    expect(result.current).toBe(undefined);
  });

  it('should return the previous value after the value changes', () => {
    const { result, rerender } = renderHook((props) => usePrevious(props), {
      initialProps: 0,
    });

    expect(result.current).toBe(undefined);

    act(() => {
      rerender(1);
    });

    expect(result.current).toBe(0);

    act(() => {
      rerender(2);
    });

    expect(result.current).toBe(1);

  });
});
