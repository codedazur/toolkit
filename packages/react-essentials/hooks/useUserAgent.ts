import Bowser from "bowser";
import { useEffect, useState } from "react";

type Result = Bowser.Parser.ParsedResult;

let globalResult: Result;

export function useUserAgent(): Result | undefined {
  const [result, setResult] = useState<Result>();

  useEffect(() => {
    if (!globalResult) {
      globalResult = Bowser.parse(window.navigator.userAgent);
    }

    setResult(globalResult);
  }, []);

  return result;
}
