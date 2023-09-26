import { Validator } from "../hooks/useForm";

/**
 * @todo Fetch the message from a localization context.
 */
export const isNotEmpty: Validator<any> = (value) =>
  value !== undefined ? null : "Please enter a value.";
