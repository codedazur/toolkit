type DebouncedFunction<F extends (...args: never[]) => ReturnType<F>> = (
  ...args: Parameters<F>
) => Promise<ReturnType<F>>;

type CancelFunction = () => void;

export function debounce<F extends (...args: never[]) => ReturnType<F>>(
  callback: F,
  ms = 50,
): [DebouncedFunction<F>, CancelFunction] {
  let timer: NodeJS.Timeout | undefined;

  return [
    (...args: Parameters<F>) =>
      new Promise((resolve) => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          timer = undefined;
          resolve(callback(...args));
        }, ms);
      }),
    () => clearTimeout(timer),
  ];
}
