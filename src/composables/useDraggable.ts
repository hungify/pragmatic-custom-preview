import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import type {
  AllDragTypes,
  BaseEventPayload,
  CleanupFn,
  DropTargetGetFeedbackArgs,
  ElementDragType,
  Input,
} from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import {
  defineComponent,
  h,
  MaybeRefOrGetter,
  onMounted,
  onUnmounted,
  ref,
  StyleValue,
  Teleport,
  toValue,
  watchEffect,
} from "vue";
import {
  DraggableGetFeedbackArgs,
  DraggableOffset,
  DraggablePreview,
  DraggableState,
} from "../shared/draggable";

interface DraggableOptions<
  TElement extends HTMLElement,
  TDragType extends AllDragTypes = ElementDragType
> {
  element: MaybeRefOrGetter<TElement | null>;
  canDrag?: (args: DraggableGetFeedbackArgs) => boolean;
  canDrop?: (args: DropTargetGetFeedbackArgs<TDragType>) => boolean;
  handle?: Element;
  getInitialData?: (args: DraggableGetFeedbackArgs) => Record<string, unknown>;
  getData?: (
    args: DropTargetGetFeedbackArgs<TDragType>
  ) => Record<string | symbol, unknown>;
  onDragLeave?: (args: BaseEventPayload<TDragType>) => void;
}

const draggablePreviewStyles: StyleValue = {
  position: "fixed",
  pointerEvents: "none",
  willChange: "transform",
  zIndex: 1000,
  top: 0,
  left: 0,
};

export const useDraggable = <TElement extends HTMLElement>(
  options: DraggableOptions<TElement>
) => {
  let cleanup: CleanupFn | null = null;

  const state = ref<DraggableState>("idle");
  const pointer = ref<Input | null>(null);
  const offset = ref<DraggableOffset | null>(null);
  const preview = ref<DraggablePreview | null>(null);
  const previewElement = ref<HTMLElement | null>(null);

  const resetDraggable = () => {
    previewElement.value = null;
    preview.value = null;
    pointer.value = null;
    offset.value = null;
  };

  onMounted(() => {
    const element = toValue(options.element);
    if (!element) return;

    cleanup = combine(
      draggable({
        element,
        getInitialData: options.getInitialData,
        canDrag: options.canDrag,
        onDragStart: ({ location }) => {
          state.value = "dragging";
          preventUnhandled.start();
          const bounds = element.getBoundingClientRect();
          const { input } = location.current;
          offset.value = {
            x: input.clientX - bounds.left,
            y: input.clientY - bounds.top,
          };
          pointer.value = input;
        },
        onDrag: ({ location }) => {
          state.value = "dragging";
          pointer.value = location.current.input;
        },
        onDrop: () => {
          state.value = "idle";
          preventUnhandled.stop();
          resetDraggable();
        },
        onGenerateDragPreview: ({ source, nativeSetDragImage }) => {
          disableNativeDragPreview({ nativeSetDragImage });
          const bounds = source.element.getBoundingClientRect();
          preview.value = {
            element: source.element,
            bounds,
          };
        },
      }),
      dropTargetForElements({
        element,
        canDrop: options.canDrop,
        getData: options.getData,
        onDragEnter: () => (state.value = "over"),
        onDragLeave: () => (state.value = "idle"),
        onDrop: () => (state.value = "idle"),
      })
    );
  });

  watchEffect(() => {
    if (!previewElement.value || !preview.value) return;

    const { width, height, left, top } = preview.value.bounds;
    Object.assign(previewElement.value.style, {
      ...draggablePreviewStyles,
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${left}px, ${top}px)`,
    });
  });

  watchEffect(() => {
    if (!previewElement.value || !pointer.value || !offset.value) return;

    const x = pointer.value.clientX - offset.value.x;
    const y = pointer.value.clientY - offset.value.y;

    requestAnimationFrame(() => {
      if (!previewElement.value) return;
      previewElement.value.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  const TeleportedPreview = defineComponent({
    inheritAttrs: false,
    props: {
      previewClass: {
        type: String,
        required: false,
        default: "",
      },
    },
    setup(props, { slots }) {
      const draggedElement = ref<HTMLElement | null>(null);

      onMounted(() => {
        const element = toValue(options.element);
        if (!element) return;

        draggedElement.value = element.cloneNode(true) as HTMLElement;
        if (props.previewClass && draggedElement.value) {
          draggedElement.value.classList.add(props.previewClass);
        }
      });
      return () =>
        preview.value && draggedElement.value
          ? h(
              Teleport,
              { to: "body" },
              h("div", { ref: previewElement }, [
                slots.default
                  ? slots.default()
                  : h(draggedElement.value.tagName.toLowerCase(), {
                      ...Object.fromEntries(
                        Array.from(draggedElement.value.attributes).map(
                          (attr) => [attr.name, attr.value]
                        )
                      ),
                    }),
              ])
            )
          : null;
    },
  });

  onUnmounted(() => {
    cleanup?.();
  });

  return {
    state,
    TeleportedPreview,
    cleanup,
  };
};
