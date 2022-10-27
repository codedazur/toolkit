import { mutateObject } from "./mutateObject";

export function revalueObject<
  Key extends string | number | symbol,
  Value,
  NewValue
>(
  record: Record<Key, Value>,
  callback: ((entry: [Key, Value]) => NewValue) | NewValue
): Record<Key, NewValue> {
  return mutateObject(record, ([key, value]) => [
    key,
    callback instanceof Function ? callback([key, value]) : callback,
  ]);
}
