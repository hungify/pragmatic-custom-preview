import { TItem } from "../shared";
import battery from "../assets/images/battery.png";
import drill from "../assets/images/drill.png";
import wallet from "../assets/images/wallet.png";
import yeti from "../assets/images/yeti.png";
import ui from "../assets/images/ui.png";
import koala from "../assets/images/koala.png";

export function isRectangleColliding({
  fixedRect,
  previewRect,
}: {
  fixedRect: DOMRect;
  previewRect: DOMRect;
}) {
  return (
    fixedRect.left < previewRect.right &&
    fixedRect.right > previewRect.left &&
    fixedRect.top < previewRect.bottom &&
    fixedRect.bottom > previewRect.top
  );
}

export function getColumns({
  count,
  prefix,
}: {
  count: number;
  prefix: string;
}): TItem[] {
  const nameUrls = [battery, drill, wallet, yeti, ui, koala];

  const items = Array.from({ length: count }, (_, itemIndex) => {
    const randomNameUrl = nameUrls[Math.floor(Math.random() * nameUrls.length)];

    return {
      id: `${prefix}-${itemIndex}`,
      title: `${prefix} ${itemIndex}`,
      pinned: itemIndex % 2 === 0,
      image: randomNameUrl,
    };
  });
  return items;
}
