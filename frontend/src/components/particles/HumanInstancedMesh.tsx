'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useParticleStore } from '@/lib/particleStore';
import { particleQuality } from '@/lib/particleQuality';
import { departureField, particleRandom as random } from '@/lib/particleDispersal';
const CHAPTER_TRAVEL_MS = 900;
const FLAG = { red: '#a52b28', green: '#1c6840', white: '#bbb7ad', black: '#151a16' };
const FINALE_FLAG = ['#e4312b', '#149954', '#ffffff', '#1e221e'];

// One flat, low-poly silhouette; every body is a single GPU instance.
function humanGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-.13,.25); shape.lineTo(.13,.25); shape.lineTo(.24,-.1);
  shape.lineTo(.15,-.14); shape.lineTo(.1,.05); shape.lineTo(.1,-.48);
  shape.lineTo(.015,-.48); shape.lineTo(0,-.16); shape.lineTo(-.015,-.48);
  shape.lineTo(-.1,-.48); shape.lineTo(-.1,.05); shape.lineTo(-.15,-.14);
  shape.lineTo(-.24,-.1); shape.closePath();
  const head = new THREE.Shape();
  head.absarc(0,.4,.12,0,Math.PI*2,false);
  return new THREE.ShapeGeometry([shape, head], 5);
}
// High-fidelity geographic border polygon of historic Palestine (34.22°E to 35.69°E, 29.50°N to 33.28°N)
const PALESTINE_BOUNDARY: [number, number][] = [
  // Northern border: Ras al-Naqoura east to Upper Galilee & Metula
  [35.10, 33.09], [35.25, 33.09], [35.39, 33.03], [35.43, 33.05], [35.48, 33.08], [35.54, 33.13], [35.57, 33.28],
  // Northern tip: Dan, Banias, Golan western slopes
  [35.65, 33.25], [35.69, 33.20], [35.67, 33.05], [35.65, 32.88],
  // Sea of Galilee & Yarmouk river junction
  [35.63, 32.75], [35.57, 32.68],
  // Jordan Valley down south along Jordan River to Dead Sea
  [35.50, 32.50], [35.52, 32.35], [35.55, 32.10], [35.50, 31.86], [35.50, 31.75],
  // Dead Sea western shore (Ein Gedi down to Sodom)
  [35.39, 31.45], [35.36, 31.31], [35.37, 31.05],
  // Wadi Araba (Arava valley) down to Gulf of Aqaba
  [35.25, 30.77], [35.15, 30.30], [35.06, 29.90], [34.98, 29.78], [34.95, 29.54],
  // Southernmost tip at Gulf of Aqaba (Umm al-Rashrash / Eilat)
  [34.89, 29.50],
  // Egyptian / Sinai diagonal border northwest towards Rafah
  [34.75, 29.80], [34.60, 30.50], [34.42, 30.88], [34.28, 31.22], [34.22, 31.30],
  // Gaza Strip coast heading northeast (Rafah, Khan Yunis, Deir al-Balah, Gaza City)
  [34.30, 31.35], [34.35, 31.42], [34.45, 31.52], [34.50, 31.58],
  // Mediterranean Coast: Ashkelon, Ashdod, Jaffa, Netanya, Hadera
  [34.56, 31.67], [34.64, 31.80], [34.73, 31.97], [34.76, 32.05], [34.80, 32.16], [34.85, 32.33], [34.89, 32.50], [34.93, 32.69],
  // Cape Carmel (Haifa promontory hook)
  [34.97, 32.83], [35.03, 32.81],
  // Akka (Acre) north to Ras al-Naqoura
  [35.07, 32.93], [35.09, 33.01], [35.10, 33.09]
];

const MIN_LON = 34.22, MAX_LON = 35.69;
const MIN_LAT = 29.50, MAX_LAT = 33.28;
const NORM_BOUNDARY: [number, number][] = PALESTINE_BOUNDARY.map(([lon, lat]) => [
  (lon - MIN_LON) / (MAX_LON - MIN_LON),
  (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)
]);

function isInsidePalestine(x: number, y: number): boolean {
  const n = NORM_BOUNDARY.length;
  let inside = false;
  let p1 = NORM_BOUNDARY[0];
  for (let i = 0; i <= n; i++) {
    const p2 = NORM_BOUNDARY[i % n];
    if (y > Math.min(p1[1], p2[1]) && y <= Math.max(p1[1], p2[1])) {
      if (x <= Math.max(p1[0], p2[0])) {
        const xinters = p1[1] !== p2[1]
          ? ((y - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]) + p1[0]
          : p1[0];
        if (p1[0] === p2[0] || x <= xinters) {
          inside = !inside;
        }
      }
    }
    p1 = p2;
  }
  return inside;
}

export default function HumanInstancedMesh() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { viewport, size, invalidate } = useThree();
  const records = useParticleStore(s => s.records);
  const archiveRecords = useParticleStore(s => s.archiveRecords);
  const total = useParticleStore(s => s.total);
  const mode = useParticleStore(s => s.mode);
  const sort = useParticleStore(s => s.sortMode);
  const query = useParticleStore(s => s.searchQuery);
  const reduced = useParticleStore(s => s.reducedMotion);
  const stageWidth = useParticleStore(s => s.stageWidth);
  const stageHeight = useParticleStore(s => s.stageHeight);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void document.fonts.ready.then(() => document.fonts.load('700 360px Amiri', 'فلسطين')).then(fonts => {
      if (alive && fonts.length) { setFontsReady(true); useParticleStore.setState({ calligraphyReady: true }); }
    }).catch(() => { /* HTML calligraphy remains visible. */ });
    return () => { alive = false; };
  }, []);
  const visibleRecords = useMemo(() => {
    if (mode !== 'archive' || !archiveRecords.length) return records;
    const ids = new Set(archiveRecords.map(r => r.id));
    return [...archiveRecords, ...records.filter(r => !ids.has(r.id))];
  }, [mode, records, archiveRecords]);
  const quality = particleQuality(size.width);
  const count = Math.min(quality.count, visibleRecords.length);
  const frameInterval = 1000 / quality.fps;
  const lastPaint = useRef(0);
  const renderTimer = useRef<number | null>(null);
  const requestRender = useCallback(() => {
    if (renderTimer.current !== null) return;
    const remaining = frameInterval - (performance.now() - lastPaint.current);
    if (remaining > 1) {
      // Wake just before the deadline; the RAF paint below still enforces the cap.
      renderTimer.current = window.setTimeout(() => { renderTimer.current = null; invalidate(); }, Math.max(0, remaining-2));
    } else invalidate();
  }, [frameInterval, invalidate]);
  useEffect(() => () => {
    if (renderTimer.current !== null) clearTimeout(renderTimer.current);
    renderTimer.current = null;
  }, []);
  useEffect(() => {
    useParticleStore.setState({ particleCount: count });
    return () => { useParticleStore.setState({ particleCount: 0 }); };
  }, [count]);
  const geometry = useMemo(() => humanGeometry(), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), []);
  const gold = useMemo(() => new THREE.Color('#d4af37'), []);
  const current = useRef(new Float32Array(2400 * 4));
  const departure = useRef(new Float32Array(2400 * 4));
  const previousMode = useRef(mode);
  const initialized = useRef(false);
  const journey = useRef({ active: false, started: 0 });
  const inspectionReady = useRef(false);
  const lastScrollInput = useRef(-Infinity);
  const dispersed = useMemo(() => departureField(count, viewport.width, viewport.height),
    [count,viewport.width,viewport.height]);
  const pointer = useRef({ x: -9999, y: -9999 });
  const hovered = useRef(-1);
  const w = (stageWidth || size.width) * viewport.width / size.width;
  const h = (stageHeight || size.height) * viewport.height / size.height;
  const number = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400; canvas.height = 350;
    const ctx = canvas.getContext('2d');
    if (!ctx || total === null) return [];
    ctx.font = 'bold 280px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString('en-US'),700,180);
    const pixels = ctx.getImageData(0,0,1400,350).data;
    const points: [number,number][] = [];
    for (let y=0;y<350;y+=4) for(let x=0;x<1400;x+=4) {
      if (pixels[(y*1400+x)*4+3]>150) points.push([x,y]);
    }
    return Array.from({length: count}, (_,i) => points[Math.floor(i * points.length / Math.max(count,1))]);
  }, [total,count]);

  // Memoized points forming the borders & territory of historic Palestine
  const palestinePoints = useMemo(() => {
    const segLengths: number[] = [];
    let totalPerimeter = 0;
    for (let i = 0; i < NORM_BOUNDARY.length - 1; i++) {
      const dx = NORM_BOUNDARY[i + 1][0] - NORM_BOUNDARY[i][0];
      const dy = NORM_BOUNDARY[i + 1][1] - NORM_BOUNDARY[i][1];
      const len = Math.hypot(dx, dy);
      segLengths.push(len);
      totalPerimeter += len;
    }

    const points: [number, number, boolean][] = [];
    const borderCount = Math.floor(count * 0.48);

    // 1. Trace the razor-sharp geographic borders of Palestine
    for (let i = 0; i < borderCount; i++) {
      const target = (i / Math.max(borderCount, 1)) * totalPerimeter;
      let acc = 0;
      for (let s = 0; s < segLengths.length; s++) {
        const segLen = segLengths[s];
        if (acc + segLen >= target || s === segLengths.length - 1) {
          const t = Math.max(0, Math.min(1, (target - acc) / Math.max(segLen, 0.0001)));
          const pA = NORM_BOUNDARY[s];
          const pB = NORM_BOUNDARY[s + 1] || NORM_BOUNDARY[0];
          const jx = (random(i, 41) - 0.5) * 0.007;
          const jy = (random(i, 42) - 0.5) * 0.007;
          points.push([pA[0] + t * (pB[0] - pA[0]) + jx, pA[1] + t * (pB[1] - pA[1]) + jy, true]);
          break;
        }
        acc += segLen;
      }
    }

    // 2. Populate the interior territory (Galilee, West Bank, Coast, Gaza, Negev)
    let attempts = 0;
    let seed = 0;
    while (points.length < count && attempts < 40000) {
      attempts++;
      seed++;
      const rx = random(seed, 101);
      const ry = random(seed, 102);
      if (isInsidePalestine(rx, ry)) {
        points.push([rx, ry, false]);
      }
    }

    // Safety fallback to fill remaining slots
    while (points.length < count) {
      const idx = points.length % Math.max(borderCount, 1);
      points.push([points[idx][0], points[idx][1], false]);
    }

    return points;
  }, [count]);

  // Memoized points forming the Arabic Calligraphy of «فلسطين» (Palestine)
  const palestineCalligraphy = useMemo(() => {
    if (!fontsReady) return [];
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.font = 'bold 360px "Amiri", "IBM Plex Sans Arabic", serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('فلسطين', 800, 300);
    const pixels = ctx.getImageData(0, 0, 1600, 600).data;
    const points: [number, number][] = [];
    for (let y = 0; y < 600; y += 4) {
      for (let x = 0; x < 1600; x += 4) {
        if (pixels[(y * 1600 + x) * 4 + 3] > 120) {
          points.push([x, y]);
        }
      }
    }
    if (!points.length) return [];
    return Array.from({ length: count }, (_, i) => points[Math.floor((i * points.length) / Math.max(count, 1))]);
  }, [count, fontsReady]);

  const targets = useMemo(() => {
    const values = new Float32Array(count * 4);
    const mobile = size.width < 760;
    const ranks = new Map(archiveRecords.map((r,i) => [r.id,i]));

    for(let i=0;i<count;i++) {
      const a = random(i), b = random(i,1), c = random(i,2), d = random(i,3);
      let x = (a-.5)*w*.85, y = (b-.5)*h*.62, z = c*2, scale = mobile ? .085 : .075;

      if(mode === 'number' || mode === 'hero') {
        const point = number[i] || [700,175];
        x=(point[0]/1400-.5)*w*(mobile ? 1.09 : 1.0);
        y=-(point[1]/350-.5)*Math.min(h, w*.32);
        scale=mobile ? .043 : .062; z=0;
      } else if(mode === 'scatter') {
        // Sovereign borders and territory of Palestine
        const pt = palestinePoints[i] || [0.5, 0.5, true];
        const [nx, ny, isBorder] = pt;
        const mapH = Math.min(h * .88, w * 2.1);
        const mapW = mapH / 2.57;
        const xCenter = 0;
        const yCenter = 0;

        x = (nx - 0.48) * mapW + xCenter;
        y = (ny - 0.50) * mapH + yCenter;
        z = isBorder ? 0.35 + c * 0.25 : (c - 0.5) * 0.7;
        scale = (mobile ? 0.052 : 0.068) + (isBorder ? 0.012 : 0) + c * 0.01;
      } else if(mode === 'names') {
        // One curved olive sprig behind the name, with brown wood and narrow leaves.
        const woodCount = Math.max(1, Math.floor(count * .24));
        const stem = (t: number) => [-w*.36+t*w*.72, -h*.28+t*h*.56-Math.sin(t*Math.PI)*h*.08];
        if (i < woodCount) {
          const t = i / Math.max(1, woodCount-1);
          const point = stem(t);
          x = point[0] + (a-.5)*w*.006;
          y = point[1] + (b-.5)*h*.014;
          scale = mobile ? .05 : .06;
        } else {
          const leaf = (i-woodCount) % 16;
          const station = Math.floor(leaf/2);
          const t = .14 + station*.11;
          const point = stem(t);
          const tangent = Math.atan2(h*(.56-.08*Math.PI*Math.cos(t*Math.PI)), w*.72);
          const angle = tangent + (leaf%2 ? 1 : -1)*.95;
          const length = w*(mobile ? .15 : .12)*(.86+station*.02);
          const along = a*length;
          const across = Math.sin(a*Math.PI)*length*.25*(b-.5);
          x = point[0]+Math.cos(angle)*along-Math.sin(angle)*across;
          y = point[1]+Math.sin(angle)*along+Math.cos(angle)*across;
          scale = mobile ? .04 : .05;
        }
        z=(c-.5)*.2;
      } else if(mode === 'archive') {
        const rank = ranks.get(visibleRecords[i]?.id);
        const active = query.trim().length>0 || sort!=='none';
        if(active && rank !== undefined) {
          const cols=mobile?8:18;
          x= -w*.24 + (rank%cols)*w*(mobile?.048:.026);
          y= -h*.02 - Math.floor(rank/cols)*.19;
          z=2; scale=mobile?.12:.14;
        } else {
          x=(a-.5)*w*.65-w*.12; y=(b-.5)*h*.26-h*.07; scale=active?.045:.075;
        }
      } else if(mode === 'stats') {
        // Creative 4th Shape: The Olive Tree of Memory & Roots (شجرة الزيتون والذاكرة)
        // Positioned in the left open stage, completely separate from the sidebar cards on the right
        const xCenter = 0;
        const treeWidth = w * .94;
        const ratio = i / Math.max(count, 1);

        if (ratio < 0.28) {
          // Roots & Trunk (Deep, ancient, grounded elders & ancestors)
          const trunkH = ratio / 0.28; // 0 to 1
          y = -h * 0.38 + trunkH * (h * 0.30);
          const flare = trunkH < 0.25 ? (0.25 - trunkH) * 4 * treeWidth * 0.14 : 0;
          x = xCenter + (b - 0.5) * (treeWidth * 0.065 + flare);
          z = (c - 0.5) * 0.9;
          scale = mobile ? 0.055 : 0.068;
        } else if (ratio < 0.60) {
          // Main Boughs & Branches (Youth and adults branching outward)
          const boughT = (ratio - 0.28) / 0.32;
          const branchSide = a > 0.5 ? 1 : -1;
          const curve = Math.pow(boughT, 0.75);
          x = xCenter + branchSide * (curve * treeWidth * 0.34 + (b - 0.5) * treeWidth * 0.08);
          y = -h * 0.12 + curve * (h * 0.32) + (c - 0.5) * h * 0.07;
          z = (d - 0.5) * 1.1;
          scale = mobile ? 0.048 : 0.06;
        } else {
          // Crown / Canopy of Leaves (Children, infants, blossoms shimmering high)
          const angle = a * Math.PI * 2;
          const radiusW = Math.sqrt(b) * (treeWidth * 0.42);
          const radiusH = Math.sqrt(c) * (h * 0.26);
          x = xCenter + Math.cos(angle) * radiusW;
          y = h * 0.12 + Math.sin(angle) * radiusH;
          z = (d - 0.5) * 1.5;
          scale = mobile ? 0.042 : 0.054;
        }
      } else if(mode === 'archivist') {
        x=dispersed.points[i*2]; y=dispersed.points[i*2+1];
        scale=dispersed.scales[i];
      } else if(mode === 'finale') {
        // Monumental Arabic Calligraphy: «فلسطين» (Palestine) formed by all souls
        const pt = palestineCalligraphy[i] || [800, 300];
        const calligW = w * (mobile ? 1.05 : 0.88);
        const calligH = (calligW / 1600) * 600;
        x = (pt[0] / 1600 - 0.5) * calligW;
        y = -(pt[1] / 600 - 0.5) * calligH;
        z = (c - 0.5) * 0.9;
        scale = mobile ? 0.052 : 0.065;
      }
      values[i*4]=x; values[i*4+1]=y; values[i*4+2]=z; values[i*4+3]=scale;
    }
    return values;
  },[count,w,h,size.width,mode,number,palestinePoints,palestineCalligraphy,archiveRecords,visibleRecords,query,sort,dispersed]);

  const quietPalette = useMemo(() => {
    const values = new Float32Array(count*3);
    const inks = [new THREE.Color('#586b53'),new THREE.Color('#7d887a')];
    for (let i=0; i<count; i++) inks[i%17===0 ? 0 : 1].toArray(values,i*3);
    return values;
  }, [count]);
  const palette = useMemo(() => {
    if (mode === 'scatter' || mode === 'archivist') return quietPalette;
    const values = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i=0; i<count; i++) {
      // Color styling per mode
      if (mode === 'finale') {
        // Preserve the original calligraphy's palette independently of the opening number.
        color.set(FINALE_FLAG[i % 4]);
      } else if (mode === 'stats') {
        // Olive tree palette: trunk/roots vs boughs vs leaves
        const ratio = i / Math.max(count, 1);
        if (ratio < 0.28) {
          color.set(i % 5 === 0 ? '#433b32' : '#3d4438'); // deep bark & earth
        } else if (ratio < 0.60) {
          color.set(i % 4 === 0 ? '#4e5b4b' : '#5b6b55'); // olive wood branches
        } else {
          color.set(i % 3 === 0 ? '#2d6a4f' : '#40916c'); // living olive leaves
        }
      } else if (mode === 'names') {
        color.set(i < Math.max(1, Math.floor(count*.24)) ? '#79563c' : i%3 === 0 ? '#436148' : '#668253');
      } else if (mode === 'number' || mode === 'hero') {
        // Spatial flag bands and the red hoist triangle, across the numeral silhouette.
        const point = number[i] || [700,175];
        const x = point[0]/1400, y = point[1]/350;
        color.set(x < .3*(1-Math.abs(y-.5)*2) ? FLAG.red
          : y < 1/3 ? FLAG.black : y < 2/3 ? FLAG.white : FLAG.green);
      } else {
        color.fromArray(quietPalette,i*3);
      }

      color.toArray(values, i*3);

    }
    return values;
  }, [mode, count, number, quietPalette]);
  const quietBlend = useRef(0);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    mesh.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (mesh.current.instanceColor?.count === count) {
      mesh.current.instanceColor.array.set(palette);
      mesh.current.instanceColor.needsUpdate = true;
    } else mesh.current.instanceColor = new THREE.InstancedBufferAttribute(palette.slice(), 3);
    quietBlend.current = 0;
    requestRender();
  }, [palette, count, requestRender]);

  const clearHighlight = useCallback(() => {
    const previous = hovered.current;
    const colours = mesh.current?.instanceColor;
    if (colours && previous >= 0 && previous < colours.count) {
      colours.setXYZ(previous, palette[previous*3], palette[previous*3+1], palette[previous*3+2]);
      mesh.current!.instanceColor!.needsUpdate = true;
    }
    hovered.current=-1;
    useParticleStore.setState({ hoveredRecord: null, hoveredScreenPos: null });
  }, [palette]);
  useEffect(() => {
    inspectionReady.current = false;
    clearHighlight();
    if (reduced) journey.current.active = false;
    else if (previousMode.current !== mode && initialized.current) {
      departure.current.set(current.current);
      journey.current = { active: true, started: performance.now() };
    }
    previousMode.current = mode;
    requestRender();
  },[targets,reduced,mode,clearHighlight,requestRender]);

  useEffect(() => useParticleStore.subscribe((s,prev) => {
    if(s.scrollY!==prev.scrollY || s.chapterProgress!==prev.chapterProgress || s.selectedRecord!==prev.selectedRecord || s.mode!==prev.mode || s.stageX!==prev.stageX || s.stageY!==prev.stageY || s.stageVisible!==prev.stageVisible) { requestRender(); }
  }),[requestRender]);

  useEffect(() => {
    const clear = () => {
      if (pointer.current.x === -9999 && hovered.current === -1) return;
      pointer.current={x:-9999,y:-9999};
      clearHighlight();
      requestRender();
    };

    // Only skip raycasting when strictly touching interactive controls or typing in chat, or over cards in section 3
    const isInteractive = (target: EventTarget | null) => {
      const el = target as Element | null;
      return Boolean(
        el && el.closest('button, a, input, select, textarea, .stat-trio-card, .generations-spectrum-container, .stats-bottom-ribbon, .one-record, .card, .chat-interface, .archivist-input-wrap, .archive-colophon, [role="button"]')
      );
    };

    const move = (event: PointerEvent) => {
      if(event.pointerType==='touch') return;
      if(isInteractive(event.target)) { clear(); return; }
      pointer.current={x:event.clientX,y:event.clientY};
      requestRender();
    };

    const nearest = (x: number, y: number) => {
      const retained = hovered.current;
      if (retained >= 0 && retained < count) {
        const dx=current.current[retained*4]/viewport.width*size.width+size.width/2-x;
        const dy=size.height/2-current.current[retained*4+1]/viewport.height*size.height-y;
        if (dx*dx+dy*dy<400) return visibleRecords[retained];
      }
      let index=-1, distance=144;
      for(let i=0;i<count;i++) {
        const dx=current.current[i*4]/viewport.width*size.width + size.width/2-x;
        const dy=size.height/2-current.current[i*4+1]/viewport.height*size.height-y;
        const d=dx*dx+dy*dy;
        if(d<distance) { distance=d; index=i; }
      }
      return index>=0 ? visibleRecords[index] : null;
    };
    const gesture = { current: null as { x: number; y: number; scroll: number; blocked: boolean; record: ReturnType<typeof nearest> } | null };
    const down = (event: PointerEvent) => {
      const blocked = !inspectionReady.current || isInteractive(event.target);
      gesture.current = { x: event.clientX, y: event.clientY, scroll: window.scrollY, blocked,
        record: blocked ? null : nearest(event.clientX,event.clientY) };
    };
    const tap = (event: PointerEvent) => {
      const pressed = gesture.current;
      gesture.current = null;
      if (!pressed || pressed.blocked || Math.hypot(event.clientX-pressed.x,event.clientY-pressed.y)>8 || Math.abs(window.scrollY-pressed.scroll)>8 || isInteractive(event.target)) return;
      const stage = useParticleStore.getState();
      if (!inspectionReady.current || !stage.stageVisible || stage.selectedRecord) return;
      // Resolve the same formed figure that was pressed, including its hover elevation.
      const record = pressed.record || nearest(event.clientX,event.clientY);
      if (record) useParticleStore.setState({ selectedRecord: record });
    };
    const cancel = () => { gesture.current = null; };
    window.addEventListener('pointerdown',down,{passive:true});
    window.addEventListener('pointercancel',cancel,{passive:true});
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerup',tap,{passive:true});
    const scroll = () => {
      inspectionReady.current = false;
      lastScrollInput.current = performance.now();
      clear();
      requestRender();
    };
    const visibility = () => { clear(); if (!document.hidden) requestRender(); };
    window.addEventListener('scroll',scroll,{passive:true});
    document.addEventListener('pointerleave',clear);
    document.addEventListener('visibilitychange',visibility);
    return () => {
      window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointercancel',cancel);
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',tap);
      window.removeEventListener('scroll',scroll);
      document.removeEventListener('pointerleave',clear);
      document.removeEventListener('visibilitychange',visibility);
    };
  },[count,visibleRecords,w,h,size.width,size.height,viewport.width,viewport.height,clearHighlight,requestRender]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); },[geometry,material]);

  // Own the single render pass so a 240Hz screen cannot force 240 GPU paints/sec.
  useFrame((state) => {
    const now = performance.now();
    const elapsed = now - lastPaint.current;
    if (elapsed < frameInterval - .5) { requestRender(); return; }
    lastPaint.current = now;
    const delta = Math.min(elapsed / 1000, .05);
    if(!mesh.current || !count) return;
    const pState = useParticleStore.getState();
    if (!pState.stageVisible || document.hidden) return;
    const departing = mode === 'number' || mode === 'scatter' || mode === 'names' || mode === 'stats';
    // Give the tree a longer reading interval, then finish dispersing before the archivist.
    const departureProgress = mode === 'stats' ? (pState.chapterProgress-.45)/.37 : (pState.chapterProgress-.13)*1.8;
    const detach = !reduced && departing ? THREE.MathUtils.clamp(departureProgress,0,1) : 0;
    const inkBlend = palette === quietPalette ? 0 : THREE.MathUtils.smoothstep(detach,.2,.9);
    if (inkBlend !== quietBlend.current && mesh.current.instanceColor) {
      const colours = mesh.current.instanceColor.array;
      for (let i=0; i<palette.length; i++) colours[i] = palette[i]+(quietPalette[i]-palette[i])*inkBlend;
      mesh.current.instanceColor.needsUpdate = true;
      quietBlend.current = inkBlend;
    }
    const progress = Math.min(1, (now-journey.current.started)/CHAPTER_TRAVEL_MS);
    const travelling = !reduced && journey.current.active && progress < 1;
    if (!travelling) journey.current.active = false;
    const arrival = 1-(1-progress)**3;
    const flow = travelling && mode !== 'archivist' ? Math.sin(progress*Math.PI)*.05 : 0;
    const offsetX = (pState.stageX / size.width - .5) * viewport.width;
    const offsetY = (.5 - pState.stageY / size.height) * viewport.height;
    const factor = reduced ? 1 : 1-Math.exp(-Math.min(delta,.05)*8);
    const formed = mode !== 'archivist' && (departing || mode === 'finale');
    const scrolling = now-lastScrollInput.current < 120;
    let unsettled=travelling || (formed && detach===0 && scrolling);
    let positionsUnsettled=false;

    // Inspect completed shapes only; the departing and quiet fields remain purely visual.
    const pickable = inspectionReady.current && formed && !travelling && detach===0 && !scrolling && !pState.selectedRecord;
    let pick=-1, distance=140;

    if(pickable && pointer.current.x >= 0 && pointer.current.y >= 0) {
      const previous = hovered.current;
      if (previous >= 0 && previous < count) {
        const dx=current.current[previous*4]/viewport.width*size.width+size.width/2-pointer.current.x;
        const dy=size.height/2-current.current[previous*4+1]/viewport.height*size.height-pointer.current.y;
        if (dx*dx+dy*dy<400) pick=previous;
      }
      if (pick < 0) for(let i=0;i<count;i++) {
        const dx=current.current[i*4]/viewport.width*size.width + size.width/2-pointer.current.x;
        const dy=size.height/2-current.current[i*4+1]/viewport.height*size.height-pointer.current.y;
        const d=dx*dx+dy*dy;
        if(d<distance) {distance=d;pick=i;}
      }
    }

    if(pick!==hovered.current) {
      const colours = mesh.current.instanceColor;
      if (colours) {
        const previous = hovered.current;
        if (previous >= 0) colours.setXYZ(previous, palette[previous*3], palette[previous*3+1], palette[previous*3+2]);
        if (pick >= 0) colours.setXYZ(pick, gold.r, gold.g, gold.b);
        colours.needsUpdate = true;
      }
      hovered.current=pick;
      useParticleStore.setState({
        hoveredRecord: pick>=0 ? visibleRecords[pick] : null,
        hoveredScreenPos: pick>=0 ? { ...pointer.current } : null
      });
    }

    for(let i=0;i<count;i++) {
      let tx=targets[i*4], ty=targets[i*4+1], tz=targets[i*4+2], ts=targets[i*4+3];

      // Interpolate in world space, including the anchor, to avoid chapter jumps.
      tx += offsetX;
      ty += offsetY;
      tx = THREE.MathUtils.lerp(tx,dispersed.points[i*2],detach);
      ty = THREE.MathUtils.lerp(ty,dispersed.points[i*2+1],detach);
      ts = THREE.MathUtils.lerp(ts,dispersed.scales[i],detach);

      // Hover feedback: smooth elevation and scale
      if(i===pick) {
        ts *= 1.38;
        tz += 0.45;
      }

      if (travelling) {
        // Morph continuously towards the incoming section's live position, without a wrap.
        current.current[i*4] = THREE.MathUtils.lerp(departure.current[i*4],tx,arrival);
        current.current[i*4+1] = THREE.MathUtils.lerp(departure.current[i*4+1],ty,arrival);
        current.current[i*4+2] = THREE.MathUtils.lerp(departure.current[i*4+2],tz,arrival);
        current.current[i*4+3] = THREE.MathUtils.lerp(departure.current[i*4+3],ts,arrival);
      } else for(let k=0;k<4;k++) {
        const target=k===0?tx:k===1?ty:k===2?tz:ts, index=i*4+k;
        const diff=target-current.current[index];
        if(Math.abs(diff)>.001) unsettled=true;
        // Hover changes depth/scale only; those effects must not revoke inspection readiness.
        if(k<2 && Math.abs(diff)>.001) positionsUnsettled=true;
        current.current[index]+=diff*factor;
      }

      const scale = Math.max(.001,current.current[i*4+3]);
      const matrices = mesh.current.instanceMatrix.array;
      const m = i*16;
      // No rotations: scale + translation can be written without Object3D/Quaternion work.
      matrices[m]=scale; matrices[m+5]=scale*(1+flow*6); matrices[m+10]=scale;
      matrices[m+12]=current.current[i*4]; matrices[m+13]=current.current[i*4+1];
      matrices[m+14]=current.current[i*4+2]; matrices[m+15]=1;
    }

    mesh.current.instanceMatrix.needsUpdate=true;
    initialized.current = true;
    const ready = formed && !travelling && detach===0 && !positionsUnsettled && !scrolling;
    if (ready && !inspectionReady.current && pointer.current.x>=0) unsettled=true;
    inspectionReady.current = ready;
    state.gl.render(state.scene, state.camera);
    if(unsettled) requestRender();
  }, 1);
  return <instancedMesh ref={mesh} args={[geometry,material,count]} frustumCulled={false} />;
}
