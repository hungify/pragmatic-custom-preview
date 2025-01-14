import { Box, Text, xcss } from "@atlaskit/primitives";
import { useState } from "react";
import { getColumns } from "./utils";
import ColumnCustom from "./components/custom-preview/column";
import Header from "./components/Header";
import ColumnNative from "./components/native-preview/column";

const columnContainerStyles = xcss({
  width: "100%",
});

const boardStyles = xcss({
  display: "flex",
  gap: "space.200",
  borderWidth: "border.width",
  borderColor: "color.border.accent.purple",
  borderStyle: "solid",
  borderRadius: "border.radius",
  padding: "space.200",
  backgroundColor: "elevation.surface.sunken",
});

const nativeSymbol = Symbol("native");
const customSymbol = Symbol("custom");

const list = [
  {
    instanceId: nativeSymbol,
    title: "Native Preview",
  },
  {
    instanceId: customSymbol,
    title: "Custom Preview",
  },
];

function App() {
  const [nativeColumns, setNativeColumns] = useState(() =>
    getColumns({ count: 50, prefix: "Native" })
  );
  const [customColumns, setCustomColumns] = useState(() =>
    getColumns({ count: 50, prefix: "Custom" })
  );

  const [scrollMode, setScrollMode] = useState<"window" | "list">("window");
  const [showImage, setShowImage] = useState(false);

  return (
    <>
      <Header
        scrollMode={scrollMode}
        setScrollMode={setScrollMode}
        showImage={showImage}
        setShowImage={setShowImage}
      />
      <Box xcss={boardStyles}>
        {list.map((item) => (
          <Box key={item.instanceId.toString()} xcss={columnContainerStyles}>
            <Text size="large" as="strong">
              {item.title}
            </Text>
            {item.instanceId === customSymbol ? (
              <ColumnCustom
                columns={customColumns}
                instanceId={item.instanceId}
                scrollMode={scrollMode}
                showImage={showImage}
                setColumns={setCustomColumns}
              />
            ) : (
              <ColumnNative
                columns={nativeColumns}
                instanceId={item.instanceId}
                scrollMode={scrollMode}
                showImage={showImage}
                setColumns={setNativeColumns}
              />
            )}
          </Box>
        ))}
      </Box>
    </>
  );
}

export default App;
