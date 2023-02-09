/**
 * @todo Currently, `env("FOO", "bar")` returns type `"bar"`, which is not
 * correct, since `process.env.FOO` could hold any string value. When TypeScript
 * v4.9 is released, use the new `satisfies` keyword to indicate that the
 * `fallback` should satisfy `T` whithout narrowing the type of `T`.
 */
export function env<T extends string>(key: string, fallback: T): T;
export function env<T extends string>(key: string, fallback?: T): T | undefined;
export function env<T extends string>(
  key: string,
  fallback?: T
): T | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value as T;
}

function string<T extends string>(key: string, fallback: T): string | T;
function string<T extends string>(key: string, fallback?: T): T | undefined;
function string<T extends string>(key: string, fallback?: T): T | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value as T;
}
env.string = string;

function int<T extends number>(key: string, fallback: T): number | T;
function int<T extends number>(
  key: string,
  fallback?: T
): number | T | undefined;
function int<T extends number>(key: string, fallback?: T): T | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return parseInt(value) as T;
}
env.int = int;

function float<T extends number>(key: string, fallback: T): number | T;
function float<T extends number>(
  key: string,
  fallback?: T
): number | T | undefined;
function float<T extends number>(key: string, fallback?: T): T | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return parseFloat(value) as T;
}
env.float = float;

function bool(key: string, fallback: boolean): boolean;
function bool(key: string, fallback?: boolean): boolean | undefined;
function bool(key: string, fallback?: boolean): boolean | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  try {
    return parseBool(value);
  } catch {
    throw new Error(`Unexpected value "${value}" for env.bool(${key})."`);
  }
}
env.bool = bool;

function date(key: string, fallback: Date): Date;
function date(key: string, fallback?: Date): Date | undefined;
function date(key: string, fallback?: Date): Date | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return new Date(value);
}
env.date = date;

function strings<T extends string>(key: string, fallback: T[]): T[];
function strings<T extends string>(
  key: string,
  fallback?: T[]
): T[] | undefined;
function strings<T extends string>(
  key: string,
  fallback?: T[]
): T[] | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.split(",") as T[];
}
env.strings = strings;

function ints<T extends number>(key: string, fallback: T[]): number[] | T[];
function ints<T extends number>(key: string, fallback?: T[]): T[] | undefined;
function ints<T extends number>(key: string, fallback?: T[]): T[] | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.split(",").map((entry) => parseInt(entry)) as T[];
}
env.ints = ints;

function floats<T extends number>(key: string, fallback: T[]): number[] | T[];
function floats<T extends number>(key: string, fallback?: T[]): T[] | undefined;
function floats<T extends number>(
  key: string,
  fallback?: T[]
): T[] | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.split(",").map((entry) => parseFloat(entry)) as T[];
}
env.floats = floats;

function bools(key: string, fallback: boolean[]): boolean[];
function bools(key: string, fallback?: boolean[]): boolean[] | undefined;
function bools(key: string, fallback?: boolean[]): boolean[] | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.split(",").map((entry) => {
    try {
      return parseBool(entry);
    } catch {
      throw new Error(`Unexpected entry "${entry}" for env.bools(${key})."`);
    }
  });
}
env.bools = bools;

function dates(key: string, fallback: Date[]): Date[];
function dates(key: string, fallback?: Date[]): Date[] | undefined;
function dates(key: string, fallback?: Date[]): Date[] | undefined {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.split(",").map((entry) => new Date(entry));
}
env.dates = dates;

function parseBool(value: string): boolean {
  switch (value) {
    case "true":
    case "1":
      return true;
    case "false":
    case "0":
      return false;
    default:
      throw new Error(`The value "${value}" cannot be converted to a boolean.`);
  }
}
