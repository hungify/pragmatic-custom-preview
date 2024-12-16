<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DraggableState, TItem } from "../../shared";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import ItemPreview from "../ItemPreview.vue";

const props = defineProps<{
  item: TItem;
  instanceId: Symbol;
  showImage: boolean;
}>();
const state = ref<DraggableState>("idle");
const itemRef = useTemplateRef<HTMLElement>("itemRef");
const previewState = ref<{
  rect: DOMRect;
  container: HTMLElement;
} | null>(null);

const isItemPinned = computed(() => props.item.pinned);

onMounted(() => {
  if (!itemRef.value) return;
  combine(
    draggable({
      element: itemRef.value,
      getInitialData: () => ({
        item: props.item,
        instanceId: props.instanceId,
      }),
      onDragStart: () => (state.value = "dragging"),
      onDrop: () => (state.value = "idle"),
      canDrag: () => !isItemPinned.value,
      onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
        const rect = source.element.getBoundingClientRect();

        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: preserveOffsetOnSource({
            element: source.element,
            input: location.current.input,
          }),
          render({ container }) {
            state.value = "preview";
            previewState.value = { rect, container };
            return () => {
              state.value = "dragging";
            };
          },
        });
      },
    }),
    dropTargetForElements({
      element: itemRef.value,
      getData: () => ({ item: props.item, instanceId: props.instanceId }),
      canDrop: ({ source }) => {
        if (source.element === itemRef.value) return false;

        const isSameInstance = source.data.instanceId === props.instanceId;
        return !isItemPinned.value && isSameInstance;
      },
      onDragEnter: () => (state.value = "over"),
      onDragLeave: () => (state.value = "idle"),
      onDrop: () => (state.value = "idle"),
    })
  );
});
</script>
<template>
  <div
    class="grid-item"
    ref="itemRef"
    :class="{
      'item-idle': state === 'idle' && !isItemPinned,
      'item-dragging': state === 'dragging',
      'item-over': state === 'over',
      'not-draggable': isItemPinned,
    }"
  >
    <img
      v-if="props.showImage"
      :src="props.item.image"
      alt="item"
      class="item-image"
    />
    <span v-else>{{ props.item.title }}</span>
    <teleport v-if="previewState" :to="previewState.container">
      <div
        :style="{
          width: `${previewState.rect.width}px`,
          height: `${previewState.rect.height}px`,
        }"
      >
        <ItemPreview :item="props.item" :showImage="props.showImage" />
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.grid-item.not-draggable {
  cursor: not-allowed;
  background-color: #d91656;
  color: #fff;
  border-color: transparent;
}

.grid-item {
  height: 40px;
  border-width: 2px;
  border-color: #6b4ce6;
  border-style: solid;
  background-color: #f4f0ff;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
  padding: 4px;
  color: #ff5630;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-idle:hover {
  background: #fcde70;
}

.item-dragging {
  filter: grayscale(0.3);
  background-color: #c4e1f6;
}

.item-over {
  transform: scale(0.9) rotate(2deg);
  filter: brightness(1.15);
  box-shadow: 0px 8px 12px #091e4226, 0px 0px 1px #091e424f;
  background: #73ec8b;
}

.item-image {
  border-radius: 50%;
  /* Workaround to make `image` not draggable. */
  pointer-events: none;
}
</style>
