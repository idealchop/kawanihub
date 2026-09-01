/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * Barangay polygons from NAMRIA/PSA via faeldon/philippines-json-maps
 * (2019, City of Las Piñas, PSGC 137601000).
 */
import type { SolicitationKind, SolicitationStatus } from '@/features/solicitation/types/solicitation';
import { lasPinasBarangays } from './las-pinas-barangays';

export const OPEN_DESK_STATUSES: SolicitationStatus[] = [
  'under_review',
  'pending_validation',
  'eligible',
  'ready_to_claim',
];

export function isOpenDeskStatus(status: SolicitationStatus): boolean {
  return OPEN_DESK_STATUSES.includes(status);
}

type Position = [number, number];
type Ring = Position[];
type GeoGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

type GeoFeature = {
  properties: { name: string };
  geometry: GeoGeometry;
};

export type BarangayShape = {
  name: string;
  polygons: Ring[][];
  path: string;
  centroid: { x: number; y: number };
  area: number;
};

const PAD = 72;
const WIDTH = 860;

function asPolygons(geometry: GeoGeometry): Ring[][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates as Ring[]];
  return geometry.coordinates as Ring[][];
}

function allPoints(polygons: Ring[][]): Position[] {
  return polygons.flatMap((polygon) => polygon.flatMap((ring) => ring));
}

function projectFactory(points: Position[]) {
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const spanLng = Math.max(maxLng - minLng, 0.0001);
  const spanLat = Math.max(maxLat - minLat, 0.0001);
  const innerWidth = WIDTH - PAD * 2;
  const height = PAD * 2 + innerWidth * (spanLat / spanLng);

  function project([lng, lat]: Position): { x: number; y: number } {
    return {
      x: PAD + ((lng - minLng) / spanLng) * innerWidth,
      y: PAD + ((maxLat - lat) / spanLat) * (height - PAD * 2),
    };
  }

  return { project, height };
}

function ringPath(ring: Ring, project: (point: Position) => { x: number; y: number }): string {
  return `${ring
    .map((point, index) => {
      const { x, y } = project(point);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ')} Z`;
}

function centroidOf(ring: Ring, project: (point: Position) => { x: number; y: number }): { x: number; y: number } {
  const pts = ring.map(project);
  const n = pts.length || 1;
  return {
    x: pts.reduce((sum, point) => sum + point.x, 0) / n,
    y: pts.reduce((sum, point) => sum + point.y, 0) / n,
  };
}

function ringArea(ring: Ring, project: (point: Position) => { x: number; y: number }): number {
  const pts = ring.map(project);
  let area = 0;
  for (let index = 0; index < pts.length; index += 1) {
    const next = pts[(index + 1) % pts.length];
    area += pts[index].x * next.y - next.x * pts[index].y;
  }
  return Math.abs(area / 2);
}

export function loadFill(count: number, max: number): string {
  if (count <= 0 || max <= 0) return '#eef3f7';
  const t = Math.sqrt(count / max);
  const red = Math.round(238 + (15 - 238) * t);
  const green = Math.round(243 + (76 - 243) * t);
  const blue = Math.round(247 + (129 - 247) * t);
  return `rgb(${red} ${green} ${blue})`;
}

export function loadLabelTone(count: number, max: number): 'dark' | 'light' {
  if (count <= 0 || max <= 0) return 'dark';
  return Math.sqrt(count / max) > 0.52 ? 'light' : 'dark';
}

export const PIPELINE_COLORS: Record<(typeof OPEN_DESK_STATUSES)[number], string> = {
  under_review: '#c9a227',
  pending_validation: '#6b8cae',
  eligible: '#2f7a6d',
  ready_to_claim: '#0F4C81',
};

export const STATUS_COLORS: Record<SolicitationStatus, string> = {
  ...PIPELINE_COLORS,
  rejected: '#a35d5d',
  claimed: '#5b6470',
};

export const FUND_COLORS = {
  remaining: '#b7c9d6',
  readyToClaim: '#0F4C81',
  claimed: '#5b6470',
} as const;

export const KIND_COLORS: Record<SolicitationKind, string> = {
  burial: '#8b5e3c',
  education: '#6b8cae',
  medical: '#0F4C81',
  events: '#c9a227',
  financial: '#2f7a6d',
  daily: '#5b6470',
};

export function buildLasPinasMap(): { shapes: BarangayShape[]; width: number; height: number } {
  const features = lasPinasBarangays.features as unknown as GeoFeature[];
  const polygonsByName = features.map((feature) => ({
    name: feature.properties.name,
    polygons: asPolygons(feature.geometry),
  }));
  const { project, height } = projectFactory(polygonsByName.flatMap((item) => allPoints(item.polygons)));

  const shapes = polygonsByName.map((item) => {
    const outer = item.polygons
      .map((polygon) => polygon[0])
      .sort((left, right) => right.length - left.length)[0];
    return {
      name: item.name,
      polygons: item.polygons,
      path: item.polygons.flatMap((polygon) => polygon.map((ring) => ringPath(ring, project))).join(' '),
      centroid: centroidOf(outer ?? [], project),
      area: outer ? ringArea(outer, project) : 0,
    };
  });

  return { shapes, width: WIDTH, height };
}
