/** biome-ignore-all lint/suspicious/noExplicitAny: <ignore> */
"use client";

import {
  ToggleGroup as ToggleGroupPrimitive,
  Toggle as TogglePrimitive,
} from "@base-ui/react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import { cloneElement, isValidElement } from "react";
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/animate-ui/primitives/effects/highlight";
import { useControlledState } from "@/hooks/use-controlled-state";
import { getStrictContext } from "@/lib/get-strict-context";

interface ToggleGroupContextType {
  value: any[];
  setValue: ToggleGroupProps["onValueChange"];
  multiple: boolean | undefined;
}

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<ToggleGroupContextType>("ToggleGroupContext");

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive>;

function ToggleGroup(props: ToggleGroupProps) {
  const [value, setValue] = useControlledState({
    value: props.value as any[],

    defaultValue: props.defaultValue as any[],
    onChange: props.onValueChange,
  });

  return (
    <ToggleGroupProvider value={{ value, setValue, multiple: props.multiple }}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        {...props}
        onValueChange={setValue}
      />
    </ToggleGroupProvider>
  );
}

type ToggleProps = Omit<
  React.ComponentProps<typeof TogglePrimitive>,
  "render"
> &
  HTMLMotionProps<"button">;

function Toggle({
  value,
  pressed,
  defaultPressed,
  onPressedChange,
  nativeButton,
  disabled,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      defaultPressed={defaultPressed}
      disabled={disabled}
      nativeButton={nativeButton}
      onPressedChange={onPressedChange}
      pressed={pressed}
      render={
        <motion.button
          data-slot="toggle"
          whileTap={{ scale: 0.95 }}
          {...props}
        />
      }
      value={value}
    />
  );
}

type ToggleGroupHighlightProps = Omit<HighlightProps, "controlledItems">;

function ToggleGroupHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: ToggleGroupHighlightProps) {
  const { value } = useToggleGroup();

  return (
    <Highlight
      controlledItems
      data-slot="toggle-group-highlight"
      exitDelay={0}
      transition={transition}
      value={value?.[0] ?? null}
      {...props}
    />
  );
}

type ToggleHighlightProps = HighlightItemProps &
  HTMLMotionProps<"div"> & {
    children: React.ReactElement;
  };

function ToggleHighlight({ children, style, ...props }: ToggleHighlightProps) {
  const { multiple, value } = useToggleGroup();

  if (!multiple) {
    return (
      <HighlightItem
        data-slot="toggle-highlight"
        style={{ inset: 0, ...style }}
        {...props}
      >
        {children}
      </HighlightItem>
    );
  }

  if (multiple && isValidElement(children)) {
    const isActive = props.value && value && value.includes(props.value);

    const element = children as React.ReactElement<React.ComponentProps<"div">>;

    return cloneElement(
      children,
      {
        style: {
          ...element.props.style,
          position: "relative",
        },
        ...element.props,
      },
      <>
        <AnimatePresence>
          {isActive && (
            <motion.div
              animate={{ opacity: 1 }}
              data-slot="toggle-highlight"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, zIndex: 0, ...style }}
              {...props}
            />
          )}
        </AnimatePresence>

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {element.props.children}
        </div>
      </>
    );
  }
}

export {
  ToggleGroup,
  ToggleGroupHighlight,
  Toggle,
  ToggleHighlight,
  useToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupHighlightProps,
  type ToggleProps,
  type ToggleHighlightProps,
  type ToggleGroupContextType,
};
