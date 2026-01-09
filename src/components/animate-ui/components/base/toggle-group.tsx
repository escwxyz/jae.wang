import type { VariantProps } from "class-variance-authority";
import { toggleVariants } from "@/components/animate-ui/components/base/toggle";
import {
  ToggleGroupHighlight as ToggleGroupHighlightPrimitive,
  ToggleGroup as ToggleGroupPrimitive,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
  ToggleHighlight as ToggleHighlightPrimitive,
  Toggle as TogglePrimitive,
  type ToggleProps as TogglePrimitiveProps,
  useToggleGroup as useToggleGroupPrimitive,
} from "@/components/animate-ui/primitives/base/toggle-group";
import { getStrictContext } from "@/lib/get-strict-context";
import { cn } from "@/lib/utils";

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<VariantProps<typeof toggleVariants>>("ToggleGroupContext");

type ToggleGroupProps = ToggleGroupPrimitiveProps &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({
  className,
  variant,
  size,
  children,
  multiple,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex w-fit items-center gap-0.5 rounded-lg data-[variant=outline]:border data-[variant=outline]:p-0.5 data-[variant=outline]:shadow-xs",
        className
      )}
      data-size={size}
      data-variant={variant}
      multiple={multiple}
      {...props}
    >
      <ToggleGroupProvider value={{ variant, size }}>
        {multiple ? (
          children
        ) : (
          <ToggleGroupHighlightPrimitive className="rounded-md bg-accent">
            {children}
          </ToggleGroupHighlightPrimitive>
        )}
      </ToggleGroupProvider>
    </ToggleGroupPrimitive>
  );
}

type ToggleProps = TogglePrimitiveProps & VariantProps<typeof toggleVariants>;

function Toggle({ className, children, variant, size, ...props }: ToggleProps) {
  const { variant: contextVariant, size: contextSize } = useToggleGroup();
  const { multiple } = useToggleGroupPrimitive();

  return (
    <ToggleHighlightPrimitive
      className={cn(multiple && "rounded-md bg-accent")}
      value={props.value?.toString()}
    >
      <TogglePrimitive
        className={cn(
          toggleVariants({
            variant: contextVariant || variant,
            size: contextSize || size,
          }),
          "min-w-0 flex-1 shrink-0 rounded-md border-0 shadow-none focus:z-10 focus-visible:z-10",
          className
        )}
        data-size={contextSize || size}
        data-variant={contextVariant || variant}
        {...props}
      >
        {children}
      </TogglePrimitive>
    </ToggleHighlightPrimitive>
  );
}

export { ToggleGroup, Toggle, type ToggleGroupProps, type ToggleProps };
