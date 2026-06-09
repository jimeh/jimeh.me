/** Controls whether a tooltip participates in the content overlay layer. */
export type TooltipLayer = "content" | "none";

/** Controls which edge of the trigger the tooltip sits on. */
export type TooltipPlacement = "bottom" | "top";

/** Controls whether focus state can reveal the tooltip. */
export type TooltipVisibility = "hover" | "hover-focus";

/** Controls tooltip text wrapping behavior. */
export type TooltipWrap = "normal" | "nowrap";

/** Options shared by Astro and HAST tooltip renderers. */
export interface TooltipClassOptions {
  className?: string;
  layer?: TooltipLayer;
  placement?: TooltipPlacement;
  visibility?: TooltipVisibility;
  wrap?: TooltipWrap;
}

const BASE_TOOLTIP_CLASSES = [
  "bg-on-surface",
  "text-surface",
  "pointer-events-none",
  "absolute",
  "left-1/2",
  "-translate-x-1/2",
  "rounded-md",
  "px-2",
  "py-1",
  "text-xs",
  "font-medium",
  "opacity-0",
  "shadow-sm",
  "transition-opacity",
  "duration-200",
];

const PLACEMENT_CLASSES: Record<TooltipPlacement, string[]> = {
  bottom: ["bottom-full", "mb-2"],
  top: ["top-full", "mt-2"],
};

const VISIBILITY_CLASSES: Record<TooltipVisibility, string[]> = {
  hover: ["group-hover:opacity-100"],
  "hover-focus": ["group-focus-within:opacity-100", "group-hover:opacity-100"],
};

const WRAP_CLASSES: Record<TooltipWrap, string[]> = {
  normal: [
    "w-max",
    "max-w-[min(22rem,calc(100vw-2rem))]",
    "text-center",
    "leading-snug",
    "whitespace-normal",
  ],
  nowrap: ["whitespace-nowrap"],
};

/** Returns the wrapper classes needed for tooltip group state. */
export function tooltipTriggerClass(className?: string): string {
  return classList(["group", "relative", "inline-block", className]);
}

/** Returns tooltip classes for Astro markup. */
export function tooltipClass(options: TooltipClassOptions = {}): string {
  return tooltipClassList(options).join(" ");
}

/** Returns tooltip classes for HAST className arrays. */
export function tooltipClassList(options: TooltipClassOptions = {}): string[] {
  const {
    className,
    layer = "none",
    placement = "top",
    visibility = "hover",
    wrap = "nowrap",
  } = options;

  return [
    ...BASE_TOOLTIP_CLASSES,
    ...(layer === "content" ? ["z-20"] : []),
    ...PLACEMENT_CLASSES[placement],
    ...WRAP_CLASSES[wrap],
    ...VISIBILITY_CLASSES[visibility],
    ...splitClassList(className),
  ];
}

function classList(values: Array<string | undefined>): string {
  return values.flatMap((value) => splitClassList(value)).join(" ");
}

function splitClassList(value: string | undefined): string[] {
  return value?.trim().split(/\s+/).filter(Boolean) ?? [];
}
