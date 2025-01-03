import { Input } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";

// Lib doesn't export these types, so we need to define them ourselves
export type DraggableGetFeedbackArgs = {
  /**
   * The user input as a drag is trying to start (the `initial` input)
   */
  input: Input;
  /**
   * The `draggable` element
   */
  element: HTMLElement;
  /**
   * The `dragHandle` element for the `draggable`
   */
  dragHandle: Element | null;
};
export interface DraggablePreview {
  element: HTMLElement;
  bounds: DOMRect;
}

export interface DraggableOffset {
  x: number;
  y: number;
}

export type DraggableState = "idle" | "preview" | "dragging" | "over";
