import { Fragment, useRef } from "react";
import { Box } from "@atlaskit/primitives";
import { createPortal } from "react-dom";
import { TItem } from "../../shared";
import { cardStyles, cardStateStyles, pinnedStyles } from "../../shared/style";
import { useDraggable } from "../../hooks/useDraggable";
import Image from "@atlaskit/image";
import CardPreview from "../Preview";

interface CardCustomProps {
  item: TItem;
  showImage: boolean;
  instanceId: symbol;
}

export default function CardCustom({
  item,
  showImage,
  instanceId,
}: CardCustomProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const { state, preview, previewElement } = useDraggable({
    element: itemRef,
    getInitialData: () => ({ item, instanceId }),
    getData: () => ({ item, instanceId }),
    canDrag: () => !item.pinned,
    canDrop: ({ source }) => {
      if (source.element === itemRef.current) return false;
      return !item.pinned && source.data.instanceId === instanceId;
    },
  });

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

      {preview &&
        createPortal(
          <Box ref={previewElement}>
            <CardPreview item={item} showImage={showImage} />
          </Box>,
          document.body
        )}
    </Fragment>
  );
}
