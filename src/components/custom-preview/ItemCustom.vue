<script setup lang="ts">
import { computed, ref } from "vue";
import { useDraggable } from "../../composables/useDraggable";
import { TItem } from "../../shared";
import ItemPreview from "../ItemPreview.vue";

const props = defineProps<{
  item: TItem;
  instanceId: Symbol;
  showImage: boolean;
}>();

const itemRef = ref<HTMLElement | null>(null);
const isItemPinned = computed(() => props.item.pinned);

const { state, TeleportedPreview } = useDraggable({
  element: itemRef,
  getInitialData: () => ({ item: props.item, instanceId: props.instanceId }),
  getData: () => ({ item: props.item, instanceId: props.instanceId }),
  canDrag: () => !isItemPinned.value,
  canDrop: ({ source }) => {
    if (source.element === itemRef.value) return false;

    const isSameInstance = source.data.instanceId === props.instanceId;
    return !isItemPinned.value && isSameInstance;
  },
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
    <TeleportedPreview previewClass="item-preview">
      <ItemPreview :item="props.item" :showImage="props.showImage" />
    </TeleportedPreview>
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
  cursor: grab;
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
  max-height: 100%;
  width: 100%;
}
</style>

<style>
.item-preview {
  transform: rotate(4deg);
}
</style>
