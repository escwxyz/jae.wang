"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
} from "motion/react";
import { Fragment } from "react/jsx-runtime";
import {
  AutoHeight,
  type AutoHeightProps,
} from "@/components/animate-ui/primitives/effects/auto-height";
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/animate-ui/primitives/effects/highlight";
import { useControlledState } from "@/hooks/use-controlled-state";
import { getStrictContext } from "@/lib/get-strict-context";

interface TabsContextType {
  value: string | undefined;
  setValue: TabsProps["onValueChange"];
}

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>("TabsContext");

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;

function Tabs(props: TabsProps) {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <TabsProvider value={{ value, setValue }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        {...props}
        onValueChange={setValue}
      />
    </TabsProvider>
  );
}

type TabsHighlightProps = Omit<HighlightProps, "controlledItems" | "value">;

function TabsHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps) {
  const { value } = useTabs();

  return (
    <Highlight
      click={false}
      controlledItems
      data-slot="tabs-highlight"
      transition={transition}
      value={value}
      {...props}
    />
  );
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

function TabsList(props: TabsListProps) {
  return <TabsPrimitive.List data-slot="tabs-list" {...props} />;
}

type TabsHighlightItemProps = HighlightItemProps & {
  value: string;
};

function TabsHighlightItem(props: TabsHighlightItemProps) {
  return <HighlightItem data-slot="tabs-highlight-item" {...props} />;
}

type TabsTabProps = React.ComponentProps<typeof TabsPrimitive.Tab>;

function TabsTab(props: TabsTabProps) {
  return <TabsPrimitive.Tab data-slot="tabs-tab" {...props} />;
}

type TabsPanelProps = React.ComponentProps<typeof TabsPrimitive.Panel> &
  HTMLMotionProps<"div">;

function TabsPanel({
  value,
  keepMounted,
  transition = { duration: 0.5, ease: "easeInOut" },
  ...props
}: TabsPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <TabsPrimitive.Panel
        keepMounted={keepMounted}
        render={
          <motion.div
            animate={{ opacity: 1, filter: "blur(0px)" }}
            data-slot="tabs-panel"
            exit={{ opacity: 0, filter: "blur(4px)" }}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            layout
            layoutDependency={value}
            transition={transition}
            {...props}
          />
        }
        value={value}
      />
    </AnimatePresence>
  );
}

type TabsPanelsAutoProps = Omit<AutoHeightProps, "children"> & {
  mode?: "auto-height";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsLayoutProps = Omit<HTMLMotionProps<"div">, "children"> & {
  mode: "layout";
  children: React.ReactNode;
  transition?: Transition;
};

type TabsPanelsProps = TabsPanelsAutoProps | TabsPanelsLayoutProps;

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

function isAutoMode(props: TabsPanelsProps): props is TabsPanelsAutoProps {
  return !props.mode || props.mode === "auto-height";
}

function TabsPanels(props: TabsPanelsProps) {
  const { value } = useTabs();

  if (isAutoMode(props)) {
    const { children, transition = defaultTransition, ...autoProps } = props;

    return (
      <AutoHeight
        data-slot="tabs-panels"
        deps={[value]}
        transition={transition}
        {...autoProps}
      >
        <Fragment key={value}>{children}</Fragment>
      </AutoHeight>
    );
  }

  const {
    children,
    style,
    transition = defaultTransition,
    ...layoutProps
  } = props;

  return (
    <motion.div
      data-slot="tabs-panels"
      layout="size"
      layoutDependency={value}
      style={{ overflow: "hidden", ...style }}
      transition={{ layout: transition }}
      {...layoutProps}
    >
      <Fragment key={value}>{children}</Fragment>
    </motion.div>
  );
}

export {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTab,
  TabsPanel,
  TabsPanels,
  type TabsProps,
  type TabsHighlightProps,
  type TabsHighlightItemProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsPanelProps,
  type TabsPanelsProps,
};
