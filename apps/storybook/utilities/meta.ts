import { Meta } from "@storybook/react";

export function meta<T extends object = Record<string, never>>(data: Meta<T>) {
  return data;
}
