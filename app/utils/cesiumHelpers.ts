import type { MutableRefObject, RefObject } from "react";
import * as Cesium from "cesium";

type DrawSurfaceOptions = {
  viewerRef: RefObject<Cesium.Viewer | null>;
  drawnSurfacesRef: MutableRefObject<any[]>;
  geoidOffset: number;
  exaggeration: number;
  isGenericMode: boolean;
  genericColor: Cesium.Color;
};
 // <-- ADD THIS
  export const getTrueMslAltitude = async (cartesian: Cesium.Cartesian3, viewerRef: RefObject<Cesium.Viewer | null>, apiBase: string): Promise<{lat: number, lon: number, alt: number}> => {
    if (!viewerRef.current) return { lat: 0, lon: 0, alt: 0 };
    const viewer = viewerRef.current;

    // 1. Get the raw coordinates of the exact 3D pixel you clicked
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const lat = parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(6));
    const lon = parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(6));

    // 2. Read the CURRENT exaggeration directly from the scene (No Refs needed!)
    const currentExag = viewer.scene.verticalExaggeration || 1.0;

    // 3. Un-scale the clicked height. 
    // If you clicked a point 301m in the air, and exag is 7, this forces it back to 43m.
    const unexaggeratedEllipsoidHeight = carto.height / currentExag;

    // 4. Fetch the EGM96 Geoid Offset to convert Ellipsoid to MSL
    let offset = 0;
    try {
        const res = await fetch(`${apiBase}/geoid-offset?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data.offset !== undefined) offset = data.offset;
    } catch (e) {
        console.warn("Geoid fetch failed", e);
    }

    // 5. Calculate final MSL (43m Ellipsoid - 38m Offset = 5m MSL)
    let trueMslAlt = parseFloat((unexaggeratedEllipsoidHeight - offset).toFixed(2));
    
    // Fallback to 0 if sea depth is weirdly negative
    if (trueMslAlt < -500) trueMslAlt = 0;

    return { lat, lon, alt: trueMslAlt };
  };


  // --- HELPER: Safely extract first [lon, lat] from any geometry entry (coords OR quads) ---
  export const getFirstCoord = (geometry: any[]): [number, number] | null => {
    if (!geometry || geometry.length === 0) return null;
    const geo = geometry[0];
    if (geo.coords && geo.coords.length >= 2) return [geo.coords[0], geo.coords[1]];
    if (geo.quads && geo.quads.length > 0 && geo.quads[0].length >= 2) return [geo.quads[0][0], geo.quads[0][1]];
    return null;
  };


  // --- THE FIX: Add explicitOffset parameter ---
export const drawSurface = (
  surfaceInput: any | any[],
  options: DrawSurfaceOptions,
  explicitOffset?: number,
  shouldZoom: boolean = true
) => {
  const { viewerRef, drawnSurfacesRef, geoidOffset, exaggeration, isGenericMode, genericColor } = options;
    if (!viewerRef.current) return;

    const surfaces = Array.isArray(surfaceInput) ? surfaceInput : [surfaceInput];
    drawnSurfacesRef.current = surfaces;

    viewerRef.current.entities.removeAll();
    const entitiesToAdd: Cesium.Entity[] = [];

    const appliedOffset = explicitOffset !== undefined ? explicitOffset : geoidOffset;

    surfaces.forEach(surface => {
      if (surface.geometry) {
        surface.geometry.forEach((geo: any) => {

          // --- THE FIX: Support grouped Quad-Lists (e.g., Conical) ---
          if (geo.quads) {
            geo.quads.forEach((quadCoords: number[]) => {
              const adjustedCoords = [...quadCoords];
              for (let i = 2; i < adjustedCoords.length; i += 3) {
                adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
              }
              const entity = viewerRef.current?.entities.add({
                name: geo.name, // They all share the same name!
                polygon: {
                  hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords),
                  perPositionHeight: true,
                  material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                  outline: true,
                  outlineColor: Cesium.Color.BLACK
                }
              });
              if (entity) entitiesToAdd.push(entity);
            });
          }
          // --- Standard Single-Polygon Processing ---
          else if (geo.coords) {
            const adjustedCoords = [...geo.coords];
            for (let i = 2; i < adjustedCoords.length; i += 3) {
              adjustedCoords[i] = (adjustedCoords[i] + appliedOffset) * exaggeration;
            }
            const entity = viewerRef.current?.entities.add({
              name: geo.name,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adjustedCoords),
                perPositionHeight: true,
                material: isGenericMode ? genericColor : Cesium.Color.fromCssColorString(geo.color).withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.BLACK
              }
            });
            if (entity) entitiesToAdd.push(entity);
          }
        });
      }
    });

    // --- THE FIX: Only zoom if shouldZoom is true ---
    if (shouldZoom && entitiesToAdd.length > 0) {
      viewerRef.current.zoomTo(entitiesToAdd, new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-45),
        5000
      ));
    }
  };
