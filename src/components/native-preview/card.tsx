import { Fragment, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";
import invariant from "tiny-invariant";

import Image from "@atlaskit/image";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Box } from "@atlaskit/primitives";
import { TItem } from "../../shared";
import { cardStateStyles, cardStyles, pinnedStyles } from "../../shared/style";
import CardPreview from "../Preview";
import { DraggableState } from "../../shared/draggable";

type PreviewState = {
  rect: DOMRect;
  container: HTMLElement;
} | null;
interface CardPreviewProps {
  item: TItem;
  showImage: boolean;
  instanceId: symbol;
}

export default function CardNative({
  item,
  showImage,
  instanceId,
}: CardPreviewProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<DraggableState>("idle");
  const [previewState, setPreviewState] = useState<PreviewState>(null);

  useEffect(() => {
    const element = itemRef.current;
    invariant(element);

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          item,
          instanceId,
        }),
        canDrag: () => !item.pinned,
        onGenerateDragPreview: ({ source, nativeSetDragImage, location }) => {
          const rect = source.element.getBoundingClientRect();
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: source.element,
              input: location.initial.input,
            }),
            render({ container }) {
              setState("preview");
              setPreviewState({
                container,
                rect,
              });
              return () => setState("dragging");
            },
          });
        },
        onDragStart: () => setState("dragging"),
        onDrop: () => setState("idle"),
      }),
      dropTargetForElements({
        element,
        getData: () => item,
        canDrop: ({ source }) => {
          if (source.element === itemRef.current) return false;
          return !item.pinned && source.data.instanceId === instanceId;
        },
        onDragStart: () => setState("over"),
        onDragEnter: () => setState("over"),
        onDragLeave: () => setState("idle"),
        onDrop: () => setState("idle"),
      })
    );
  }, [instanceId, item]);

  return (
    <Fragment>
      <Box
        ref={itemRef}
        xcss={[cardStyles, cardStateStyles[state], item.pinned && pinnedStyles]}
      >
        {showImage ? (
          <Image
            src={item.image}
            alt={item.title}
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <span>{item.title}</span>
        )}
      </Box>
      {state === "preview" && previewState
        ? createPortal(
            <Box
              style={{
                width: previewState.rect.width,
                height: previewState.rect.height,
              }}
            >
              <CardPreview item={item} showImage={showImage} />
            </Box>,
            previewState.container
          )
        : null}
    </Fragment>
  );
}
