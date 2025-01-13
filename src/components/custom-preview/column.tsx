import { useEffect, useRef } from "react";

import invariant from "tiny-invariant";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { Box, Grid } from "@atlaskit/primitives";

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import { TItem } from "../../shared";
import { columnScrollStyles, columnStyles } from "../../shared/style";
import CardCustom from "./card";

interface ColumnCustomProps {
  columns: TItem[];
  setColumns: React.Dispatch<React.SetStateAction<TItem[]>>;
  instanceId: symbol;

  showImage: boolean;
  scrollMode: "window" | "list";
}

export default function ColumnCustom({
  columns,
  setColumns,
  showImage,
  instanceId,
  scrollMode,
}: ColumnCustomProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = listRef.current;
    invariant(element);

    return combine(
      autoScrollForElements({
        element,
      }),
      autoScrollWindowForElements(),
      monitorForElements({
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0];

          if (!target) {
            preventUnhandled.start();
            return;
          }
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
      ref={listRef}
      xcss={[columnStyles, scrollMode === "list" && columnScrollStyles]}
      padding="space.200"
    >
      <Grid templateColumns="1fr 1fr" gap="space.200">
        {columns.map((item) => (
          <CardCustom
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
