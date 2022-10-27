import { mutateObject } from "./mutateObject";

export function rekeyObject<
  Key extends string | number | symbol,
  Value,
  NewKey extends string | number | symbol
>(
  record: Record<Key, Value>,
  callback: (entry: [Key, Value]) => NewKey
): Record<NewKey, Value> {
  return mutateObject(record, ([key, value]) => [
    callback([key, value]),
    value,
  ]);
}
