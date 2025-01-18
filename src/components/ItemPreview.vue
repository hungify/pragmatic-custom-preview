<script setup lang="ts">
import { TItem } from "../shared";

const props = defineProps<{
  item: TItem;
  showImage: boolean;
}>();
</script>

<template>
  <div class="grid-item">
    <img
      v-if="props.showImage"
      :src="props.item.image"
      alt="item"
      class="item-image"
    />
    <span v-else>{{ props.item.title }}</span>
  </div>
</template>

<style scoped>
.grid-item {
  border-width: 2px;
  border-color: #6b4ce6;
  border-style: solid;
  background-color: transparent;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
  padding: 4px;
  color: #ff5630;
  transform: rotate(4deg);
  width: 100%;
}

.item-image {
  border-radius: 50%;
  /* Workaround to make `image` not draggable. */
  pointer-events: none;
  max-height: 100%;
  width: 100%;
}
</style>
