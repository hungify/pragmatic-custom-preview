import { easeInOut } from "@atlaskit/motion";
import { smallDurationMs } from "@atlaskit/motion/durations";
import { xcss } from "@atlaskit/primitives";
import { DraggableState } from "./draggable";

export const cardStyles = xcss({
  borderWidth: "border.width",
  borderColor: "color.border.accent.purple",
  borderStyle: "solid",
  backgroundColor: "color.background.accent.purple.subtler",
  borderRadius: "border.radius",
  transitionProperty: "background-color, opacity",
  transition: `all ${smallDurationMs}ms ${easeInOut}`,
  transitionTimingFunction: easeInOut,

  display: "flex",
  alignItems: "center",
  padding: "space.050",

  color: "color.text.accent.red",
  height: "100%",
  width: "100%",
  boxSizing: "border-box",
  cursor: "grab",
});

export const cartPreviewStyles = xcss({
  transform: "rotate(4deg)",
});

export const cardStateStyles: {
  [Key in DraggableState]: ReturnType<typeof xcss> | undefined;
} = {
  idle: xcss({
    ":hover": {
      background: "elevation.surface.overlay",
      boxShadow: "elevation.shadow.overflow",
    },
  }),
  dragging: xcss({
    filter: "grayscale(0.8)",
  }),
  over: xcss({
    transform: "scale(0.9) rotate(1.2deg)",
    filter: "brightness(1.15)",
    boxShadow: "elevation.shadow.overlay",
  }),
  preview: undefined,
};

export const pinnedStyles = xcss({
  backgroundColor: "color.background.accent.orange.subtlest.pressed",
  color: "color.text.accent.yellow",
  cursor: "not-allowed",
});

export const previewStyles = (preview: { bounds: DOMRect }) => ({
  position: "fixed",
  width: `${preview.bounds.width}px`,
  height: `${preview.bounds.height}px`,
  pointerEvents: "none",
  willChange: "transform",
  zIndex: 1000,
  top: 0,
  left: 0,
  transform: `translate(${preview.bounds.left}px, ${preview.bounds.top}px)`,
});

export const columnStyles = xcss({
  width: "100%",
  backgroundColor: "elevation.surface",
  borderColor: "color.border.accent.purple",
  borderRadius: "border.radius",
  borderWidth: "border.width",
  borderStyle: "solid",
  flexShrink: 0,
});

export const columnScrollStyles = xcss({
  overflowY: "auto",
  height: "500px",
});
