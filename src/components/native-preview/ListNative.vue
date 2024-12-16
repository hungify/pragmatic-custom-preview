<script setup lang="ts">
import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { onMounted, useTemplateRef } from "vue";
import { TItem } from "../../shared";
import ItemNative from "./ItemNative.vue";

const scrollableRef = useTemplateRef("listRef");
const props = defineProps<{
  items: TItem[];
  instanceId: Symbol;
  scrollMode: "window" | "list";
  showImage: boolean;
}>();

defineEmits<{
  "update:items": (items: TItem[]) => void;
}>();

const items = defineModel("items", {
  type: Array as () => TItem[],
  default: () => [],
});

onMounted(() => {
  if (!scrollableRef.value) {
    return;
  }

  combine(
    autoScrollForElements({
      element: scrollableRef.value,
    }),
    autoScrollWindowForElements(),
    monitorForElements({
      canMonitor({ source }) {
        return source.data.instanceId === props.instanceId;
      },
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];

        if (!target) {
          return;
        }
        const sourceItem = source.data.item as TItem;
        const destinationItem = target.data.item as TItem;

        const sourceIndex = props.items.findIndex(
          (item) => item.id === sourceItem.id
        );
        const destinationIndex = props.items.findIndex(
          (item) => item.id === destinationItem.id
        );

        const listClone = [...props.items];
        listClone.splice(sourceIndex, 1);
        listClone.splice(destinationIndex, 0, sourceItem);

        items.value = listClone;
      },
    })
  );
});
</script>

<template>
    <div
    class="list"
    ref="listRef"
    :class="{ 'list-scroll': props.scrollMode === 'list' }"
  >
    <transition-group name="list" tag="div" class="list">
      <ItemNative
        v-for="item in props.items"
        :item="item"
        :instanceId="props.instanceId"
        :showImage="props.showImage"
        :key="item.id"
      />
    </transition-group>
  </div>
</template>

<style scoped>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(calc(150px * 1), 1fr));
  width: 100%;
  gap: 10px;
  user-select: none;
}
.list.list-scroll {
  overflow-y: auto;
  border-radius: 5px;
  height: 500px;
}
</style>
