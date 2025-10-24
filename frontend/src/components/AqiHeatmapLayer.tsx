// src/components/AqiHeatmapLayer.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { aqiService, type AqiFetchResponse } from '../services/aqi';

/**
 * Convert PM2.5 concentration (µg/m³) to AQI using US EPA breakpoints.
 * Returns a number with double precision (JavaScript Number is IEEE-754 double).
 *
 * Formula:
 * AQI = (I_hi - I_lo) / (BP_hi - BP_lo) * (C - BP_lo) + I_lo
 * Where:
 *  - C is concentration,
 *  - BP_lo/BP_hi are breakpoints for PM2.5,
 *  - I_lo/I_hi are AQI breakpoints.
 */
function pm25ToAqi(pm25: number): number {
  // Ensure non-negative
  const C = Math.max(pm25, 0);

  type Range = { Clow: number; Chigh: number; Ilow: number; Ihigh: number };
  const ranges: Range[] = [
    { Clow: 0.0,   Chigh: 12.0,   Ilow: 0,   Ihigh: 50 },
    { Clow: 12.1,  Chigh: 35.4,   Ilow: 51,  Ihigh: 100 },
    { Clow: 35.5,  Chigh: 55.4,   Ilow: 101, Ihigh: 150 },
    { Clow: 55.5,  Chigh: 150.4,  Ilow: 151, Ihigh: 200 },
    { Clow: 150.5, Chigh: 250.4,  Ilow: 201, Ihigh: 300 },
    { Clow: 250.5, Chigh: 350.4,  Ilow: 301, Ihigh: 400 },
    { Clow: 350.5, Chigh: 500.4,  Ilow: 401, Ihigh: 500 },
  ];

  for (const r of ranges) {
    if (C >= r.Clow && C <= r.Chigh) {
      const aqi =
        ((r.Ihigh - r.Ilow) / (r.Chigh - r.Clow)) * (C - r.Clow) + r.Ilow;
      return aqi;
    }
  }

  // Above last breakpoint, cap to 500
  if (C > 500.4) return 500;
  // Fallback
  return 0;
}

/**
 * Normalize AQI into intensity for leaflet.heat: 0.0 - 1.0
 * We cap AQI at 500 and divide by 500.
 */
function aqiToIntensity(aqi: number): number {
  const capped = Math.max(0, Math.min(500, aqi));
  return capped / 500;
}

type AqiHeatmapLayerProps = {
  options?: L.HeatMapOptions;
  fetchBoundsPadding?: number; // degrees padding around map bounds to include more points
};

export function AqiHeatmapLayer({ options, fetchBoundsPadding = 0 }: AqiHeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let heatLayer: L.Layer | null = null;
    let unsubMoveEnd: (() => void) | null = null;

    const buildGradient: L.HeatMapOptions['gradient'] = {
      0.0: '#00e400', // Good (Green)
      0.2: '#ffff00', // Moderate (Yellow)
      0.4: '#ff7e00', // Unhealthy for Sensitive Groups (Orange)
      0.6: '#ff0000', // Unhealthy (Red)
      0.8: '#8f3f97', // Very Unhealthy (Purple)
      1.0: '#7e0023', // Hazardous (Maroon)
    };

    const makeHeatLayer = (points: AqiFetchResponse) => {
      const heatData: L.HeatLatLngTuple[] = points.map(([lat, lon, _aqiServer, pm25]) => {
        const aqiFromPm25 = pm25 != null ? pm25ToAqi(pm25) : (_aqiServer ?? 0);
        const intensity = aqiToIntensity(aqiFromPm25);
        return [lat, lon, intensity];
      });

      // Remove existing
      if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
      }

      heatLayer = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        max: 1.0,
        gradient: buildGradient,
        ...(options || {}),
      });

      heatLayer?.addTo(map);
    };

    const fetchAndRender = async () => {
      const b = map.getBounds();
      let lat_min = b.getSouth();
      let lon_min = b.getWest();
      let lat_max = b.getNorth();
      let lon_max = b.getEast();

      if (fetchBoundsPadding !== 0) {
        lat_min -= fetchBoundsPadding;
        lon_min -= fetchBoundsPadding;
        lat_max += fetchBoundsPadding;
        lon_max += fetchBoundsPadding;
      }

      try {
        const points = await aqiService.fetchPoints({
          lat_min,
          lon_min,
          lat_max,
          lon_max,
        });
        makeHeatLayer(points);
      } catch (e) {
        // Optional: log or toast
        // console.error('Failed to fetch AQI points:', e);
      }
    };

    // Initial fetch
    fetchAndRender();

    // Re-fetch on map move end to update with new bounds
    const onMoveEnd = () => {
      fetchAndRender();
    };
    map.on('moveend', onMoveEnd);
    unsubMoveEnd = () => map.off('moveend', onMoveEnd);

    return () => {
      if (unsubMoveEnd) unsubMoveEnd();
      if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
      }
    };
  }, [map, options, fetchBoundsPadding]);

  return null;
}