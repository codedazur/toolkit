import { Validator } from "../hooks/useForm";

export const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * @todo Fetch the message from a localization context.
 */
export const isEmail: Validator<string> = (value) =>
  emailPattern.test(value ?? "") ? null : "Please enter a valid email address.";
