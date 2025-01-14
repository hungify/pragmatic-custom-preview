import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import type {
  AllDragTypes,
  BaseEventPayload,
  DropTargetGetFeedbackArgs,
  ElementDragType,
  Input,
} from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DraggableGetFeedbackArgs,
  DraggableOffset,
  DraggablePreview,
  DraggableState,
} from "../shared/draggable";
import { previewStyles } from "../shared/style";

interface DraggableOptions<
  TElement extends HTMLElement,
  TDragType extends AllDragTypes = ElementDragType
> {
  element: RefObject<TElement>;
  canDrag?: (args: DraggableGetFeedbackArgs) => boolean;
  canDrop?: (args: DropTargetGetFeedbackArgs<TDragType>) => boolean;
  handle?: Element;
  getInitialData?: (args: DraggableGetFeedbackArgs) => Record<string, unknown>;
  getData?: (
    args: DropTargetGetFeedbackArgs<TDragType>
  ) => Record<string | symbol, unknown>;
  onDragLeave?: (args: BaseEventPayload<TDragType>) => void;
}

export const useDraggable = <TElement extends HTMLElement>(
  options: DraggableOptions<TElement>
) => {
  const [state, setState] = useState<DraggableState>("idle");
  const [pointer, setPointer] = useState<Input | null>(null);
  const [offset, setOffset] = useState<DraggableOffset | null>(null);
  const [preview, setPreview] = useState<DraggablePreview | null>(null);
  const previewElement = useRef<HTMLElement | null>(null);

  const resetDraggable = useCallback(() => {
    previewElement.current = null;
    setPreview(null);
    setPointer(null);
    setOffset(null);
  }, []);

  useEffect(() => {
    const element = options.element.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: options.getInitialData,
        canDrag: options.canDrag,
        onDragStart: ({ location }) => {
          setState("dragging");
          const { input } = location.current;
          const bounds = element.getBoundingClientRect();
          setOffset({
            x: input.clientX - bounds.left,
            y: input.clientY - bounds.top,
          });
          setPointer(input);
        },
        onDrag: ({ location }) => {
          setState("dragging");
          const { input } = location.current;
          setPointer(input);
        },
        onDrop: () => {
          setState("idle");
          resetDraggable();
        },
        onGenerateDragPreview: ({ source, nativeSetDragImage }) => {
          disableNativeDragPreview({ nativeSetDragImage });
          const bounds = source.element.getBoundingClientRect();
          setPreview({
            bounds,
          });
        },
      }),
      dropTargetForElements({
        element,
        canDrop: options.canDrop,
        getData: options.getData,
        onDragEnter: () => setState("over"),
        onDragLeave: () => setState("idle"),
        onDrop: () => setState("idle"),
      })
    );
  }, [options, resetDraggable]);

  useLayoutEffect(() => {
    if (!previewElement.current || !preview) return;

    Object.assign(
      previewElement.current.style,
      previewStyles({
        bounds: preview.bounds,
      })
    );
  }, [previewElement, pointer, offset, preview]);

  useLayoutEffect(() => {
    const element = previewElement.current;
    if (!element || !pointer || !offset) return;

    const animationFrame = requestAnimationFrame(() => {
      if (!element) return;
      const x = pointer.clientX - offset.x;
      const y = pointer.clientY - offset.y;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [previewElement, pointer, offset]);

  return {
    state,
    preview,
    previewElement,
  };
};
