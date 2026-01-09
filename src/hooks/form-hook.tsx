import { createFormHook } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldContext,
  formContext,
} from "@/components/ui/form";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field,
    Label: FieldLabel,
    Description: FieldDescription,
    Error: FieldError,
  },
  formComponents: {},
});
