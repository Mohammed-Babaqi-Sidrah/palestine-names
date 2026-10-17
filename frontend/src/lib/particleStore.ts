/**
 * Global store for the human particle field.
 * Controls scene mode, hover state, search highlights, and camera.
 */
import { create } from 'zustand';
import type { Record, Statistics, DatasetMetadata } from './types';

export type SceneMode =
  | 'hero'        // pre-scatter, number shape
  | 'number'      // figures form the number "72,835"
  | 'scatter'     // free-floating crowd
  | 'names'       // names emerge near figures
  | 'impact'      // calm, poetry moment
  | 'stats'       // figures reorganize into bar chart
  | 'archive'     // archive overlay, search enabled
  | 'archivist'   // archivist section
  | 'finale';     // final scene

interface ParticleState {
  total: number | null;
  statistics: Statistics | null;
  dataset: DatasetMetadata | null;
  stageWidth: number;
  stageHeight: number;
  stageX: number;
  stageY: number;
  stageVisible: boolean;
  calligraphyReady: boolean;
  dataStatus: 'loading' | 'ready' | 'error';
  reducedMotion: boolean;
  webglReady: boolean;
  particleCount: number;
  chapterProgress: number;
  selectedRecord: Record | null;
  archiveRecords: Record[];
  mode: SceneMode;
  scrollProgress: number;           // 0–1 overall page scroll
  scrollY: number;                  // Reader position drives the bounded current in the suspended field
  hoveredId: string | null;         // record ID of hovered human
  hoveredRecord: Record | null;     // full record data for popup
  hoveredScreenPos: { x: number; y: number } | null;
  highlightIds: Set<string>;        // search-highlighted IDs
  searchQuery: string;
  sortMode: 'none' | 'age' | 'name';
  sortAscending: boolean;
  records: Record[];                // sampled records for 3D field

  // Actions
  setMode: (mode: SceneMode) => void;
  setScrollProgress: (p: number) => void;
  setHovered: (id: string | null, record: Record | null, pos: { x: number; y: number } | null) => void;
  setHighlightIds: (ids: string[]) => void;
  setSearchQuery: (q: string) => void;
  setSortMode: (mode: 'none' | 'age' | 'name', ascending: boolean) => void;
  setRecords: (records: Record[]) => void;
}

export const useParticleStore = create<ParticleState>((set) => ({
  total: null,
  statistics: null,
  dataset: null,
  stageWidth: 0,
  stageHeight: 0,
  stageX: 0,
  stageY: 0,
  stageVisible: false,
  calligraphyReady: false,
  dataStatus: 'loading',
  reducedMotion: true,
  webglReady: false,
  particleCount: 0,
  chapterProgress: 0,
  selectedRecord: null,
  archiveRecords: [],
  mode: 'hero',
  scrollProgress: 0,
  scrollY: 0,
  hoveredId: null,
  hoveredRecord: null,
  hoveredScreenPos: null,
  highlightIds: new Set(),
  searchQuery: '',
  sortMode: 'none',
  sortAscending: true,
  records: [],

  setMode: (mode) => set({ mode }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setHovered: (id, record, pos) =>
    set({ hoveredId: id, hoveredRecord: record, hoveredScreenPos: pos }),
  setHighlightIds: (ids) => set({ highlightIds: new Set(ids) }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortMode: (mode, ascending) => set({ sortMode: mode, sortAscending: ascending }),
  setRecords: (records) => set({ records }),
}));
