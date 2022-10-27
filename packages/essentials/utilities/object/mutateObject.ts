import { mapObject } from "./mapObject";

export function mutateObject<
  Key extends string | number | symbol,
  Value,
  NewKey extends string | number | symbol,
  NewValue
>(
  record: Record<Key, Value>,
  callback: (entry: [Key, Value]) => [NewKey, NewValue]
): Record<NewKey, NewValue> {
  return Object.fromEntries(mapObject(record, callback)) as Record<
    NewKey,
    NewValue
  >;
}
