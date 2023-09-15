import { revalueObject } from "@codedazur/essentials";
import { useSynchronizedRef } from "@codedazur/react-essentials";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type FieldTypes = Record<string, FieldType>;

type FieldType = string | number;

interface UseFormOptions<T extends FieldTypes> {
  fields: { [K in keyof T]: FieldOptions<T[K]> };
  onSubmit: (values: FieldValues<T>) => void | Promise<void>;
}

interface FieldOptions<V extends FieldType> {
  validation?: Validator<V> | Validator<V>[];
  initialValue?: V;
}

export type Validator<V extends FieldType> = (
  value: V | undefined
) => string | null;

interface UseFormResult<T extends FieldTypes> {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  isValid: boolean;
  fields: { [K in keyof T]: FieldProps<T[K]> };
}

export interface FieldProps<
  V extends FieldType,
  E extends HTMLElement = HTMLInputElement | HTMLSelectElement
> {
  name: string;
  value: V | undefined;
  error: string | null;
  isTouched: boolean;
  onChange: ChangeEventHandler<E>;
  onBlur: ChangeEventHandler<E>;
  disabled: boolean;
}

type FieldValues<T extends FieldTypes> = { [K in keyof T]: T[K] | undefined };
type FieldTouched<T extends FieldTypes> = { [K in keyof T]: boolean };
type FieldErrors<T extends FieldTypes> = { [K in keyof T]: string | null };

export function useForm<T extends FieldTypes>({
  fields,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const fieldsRef = useSynchronizedRef(fields);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState<FieldValues<T>>(
    revalueObject(
      fields,
      ([key, options]) => options.initialValue
    ) as FieldValues<T>
  );

  const getErrors = useCallback(
    (values: FieldValues<T>) =>
      revalueObject(fieldsRef.current, ([key, { validation }]) => {
        const validators = Array.isArray(validation)
          ? validation
          : [validation];

        for (const validator of validators) {
          const error = validator?.(values[key]);

          if (error) {
            return error;
          }
        }

        return null;
      }),
    [fieldsRef]
  );

  const [errors, setErrors] = useState<FieldErrors<T>>(getErrors(values));

  const [isTouched, setIsTouched] = useState<FieldTouched<T>>(
    revalueObject(fields, false)
  );

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValues((values) => ({
      ...values,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const onBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIsTouched((isTouched) => ({
      ...isTouched,
      [event.target.name]: true,
    }));
  }, []);

  useEffect(() => {
    setErrors(getErrors(values));
  }, [getErrors, values]);

  const clear = useCallback(() => {
    setValues(revalueObject(fieldsRef.current, undefined));
    setIsTouched(revalueObject(fieldsRef.current, false));
  }, [fieldsRef]);

  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsTouched(revalueObject(fieldsRef.current, true));

      if (!isValid) {
        return;
      }

      setIsSubmitting(true);
      await onSubmit(values);
      setIsSubmitting(false);

      clear();
    },
    [fieldsRef, isValid, onSubmit, clear, values]
  );

  return {
    onSubmit: handleSubmit,
    isSubmitting,
    isValid,
    fields: revalueObject(fields, ([key]) => ({
      name: key.toString(),
      value: values[key],
      error: errors[key],
      isTouched: isTouched[key],
      onChange: onChange,
      onBlur: onBlur,
      disabled: isSubmitting,
    })) as UseFormResult<T>["fields"],
  };
}
