"use client";

import type { RefObject } from "react";

type CesiumMapProps = {
  cesiumContainer: RefObject<HTMLDivElement | null>;
};

export default function CesiumMap({ cesiumContainer }: CesiumMapProps) {
  return <div ref={cesiumContainer} style={{ width: "100%", height: "100%" }} />;
}
