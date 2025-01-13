import { useEffect, useRef } from "react";

import invariant from "tiny-invariant";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { Box, Grid } from "@atlaskit/primitives";

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { TItem } from "../../shared";
import { columnScrollStyles, columnStyles } from "../../shared/style";
import CardNative from "./card";

interface ColumnNativeProps {
  columns: TItem[];
  setColumns: React.Dispatch<React.SetStateAction<TItem[]>>;
  instanceId: symbol;

  showImage: boolean;
  scrollMode: "window" | "list";
}
export default function ColumnNative({
  columns,
  instanceId,
  scrollMode,
  setColumns,
  showImage,
}: ColumnNativeProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    invariant(element);

    return combine(
      autoScrollForElements({
        element,
      }),
      autoScrollWindowForElements(),
      monitorForElements({
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0];
          if (!target) return;

          const sourceItem = source.data.item as TItem;
          const destinationItem = target.data.item as TItem;

          const sourceIndex = columns.findIndex(
            (item) => item.pinned === false && item.id === sourceItem.id
          );
          const destinationIndex = columns.findIndex(
            (item) => item.pinned === false && item.id === destinationItem.id
          );

          if (sourceIndex === -1 || destinationIndex === -1) {
            return;
          }

          setColumns((columns) => {
            const listClone = [...columns];
            listClone[sourceIndex].pinned = true;
            const [sourceItem] = listClone.splice(sourceIndex, 1);
            listClone.splice(destinationIndex, 0, sourceItem);
            return listClone;
          });
        },
      })
    );
  }, [columns, setColumns]);

  return (
    <Box
      ref={ref}
      xcss={[columnStyles, scrollMode === "list" && columnScrollStyles]}
      padding="space.200"
    >
      <Grid templateColumns="1fr 1fr" gap="space.200">
        {columns.map((item) => (
          <CardNative
            key={item.id}
            item={item}
            showImage={showImage}
            instanceId={instanceId}
          />
        ))}
      </Grid>
    </Box>
  );
}
