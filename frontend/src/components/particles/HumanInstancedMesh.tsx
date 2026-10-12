'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useParticleStore } from '@/lib/particleStore';

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
function random(i: number, salt = 0) {
  const n = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
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
  const count = Math.min(size.width < 760 ? 1000 : 2400, visibleRecords.length);
  const geometry = useMemo(() => humanGeometry(), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const current = useRef(new Float32Array(2400 * 4));
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
        x=(a>.5?1:-1)*(w*.32+b*w*.19); y=(c-.5)*h*.7; scale=.07;
        if(i===0) { x=0; y=h*.01; z=3; scale=mobile ? .7 : 1.05; }
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
        x=(a-.5)*w*.92; y=(b-.5)*h*.86;
        scale=.025;
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
  },[count,w,h,size.width,mode,number,palestinePoints,palestineCalligraphy,archiveRecords,visibleRecords,query,sort]);

  useEffect(() => {
    hovered.current=-1;
    useParticleStore.setState({ hoveredRecord: null, hoveredScreenPos: null });
    invalidate();
  },[targets,reduced,invalidate]);

  useEffect(() => useParticleStore.subscribe((s,prev) => {
    if(s.chapterProgress!==prev.chapterProgress || s.selectedRecord!==prev.selectedRecord || s.mode!==prev.mode || s.stageX!==prev.stageX || s.stageY!==prev.stageY || s.stageVisible!==prev.stageVisible) { invalidate(); }
  }),[invalidate]);

  useEffect(() => {
    const clear = () => {
      pointer.current={x:-9999,y:-9999};
      hovered.current=-1;
      useParticleStore.setState({ hoveredRecord:null, hoveredScreenPos:null });
      invalidate();
    };

    // Only skip raycasting when strictly touching interactive controls or typing in chat, or over cards in section 3
    const isInteractive = (target: EventTarget | null) => {
      const el = target as Element | null;
      return Boolean(
        el && el.closest('button, a, input, select, textarea, .stat-trio-card, .generations-spectrum-container, .stats-bottom-ribbon, .one-record, .card, .chat-interface, .archivist-input-wrap, [role="button"]')
      );
    };

    const move = (event: PointerEvent) => {
      if(event.pointerType==='touch') return;
      if(isInteractive(event.target)) { clear(); return; }
      pointer.current={x:event.clientX,y:event.clientY};
      invalidate();
    };

    const tap = (event: PointerEvent) => {
      if (!gesture.current || Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8 || Math.abs(window.scrollY - gesture.current.scroll) > 8) return;
      gesture.current = null;
      if(isInteractive(event.target)) return;
      const stage = useParticleStore.getState();
      if (!stage.stageVisible || stage.selectedRecord) return;
      if(!['number','scatter','stats','finale'].includes(useParticleStore.getState().mode)) return;
      let index=-1, distance=144;
      for(let i=0;i<count;i++) {
        const dx=current.current[i*4]/viewport.width*size.width + size.width/2-event.clientX;
        const dy=size.height/2-current.current[i*4+1]/viewport.height*size.height-event.clientY;
        const d=dx*dx+dy*dy;
        if(d<distance) { distance=d; index=i; }
      }
      if(index>=0 && visibleRecords[index]) useParticleStore.setState({ selectedRecord:visibleRecords[index] });
    };

    const gesture = { current: null as { x: number; y: number; scroll: number } | null };
    const down = (event: PointerEvent) => { gesture.current = { x: event.clientX, y: event.clientY, scroll: window.scrollY }; };
    const cancel = () => { gesture.current = null; };
    window.addEventListener('pointerdown',down,{passive:true});
    window.addEventListener('pointercancel',cancel,{passive:true});
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerup',tap,{passive:true});
    window.addEventListener('scroll',clear,{passive:true});
    document.addEventListener('pointerleave',clear);
    document.addEventListener('visibilitychange',clear);
    return () => {
      window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointercancel',cancel);
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',tap);
      window.removeEventListener('scroll',clear);
      document.removeEventListener('pointerleave',clear);
      document.removeEventListener('visibilitychange',clear);
    };
  },[count,visibleRecords,w,h,size.width,size.height,viewport.width,viewport.height,invalidate]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); },[geometry,material]);

  useFrame((_state, delta) => {
    if(!mesh.current || !count) return;
    const pState = useParticleStore.getState();
    if (!pState.stageVisible || document.hidden) return;
    const offsetX = (pState.stageX / size.width - .5) * viewport.width;
    const offsetY = (.5 - pState.stageY / size.height) * viewport.height;
    const factor = reduced ? 1 : 1-Math.exp(-Math.min(delta,.05)*8);
    let unsettled=false;

    // Enable hover picking in number, scatter, stats (tree), and finale (calligraphy)
    const pickable = ['number','scatter','stats','finale'].includes(mode) && !pState.selectedRecord;
    let pick=-1, distance=140;

    if(pickable) for(let i=0;i<count;i++) {
      const dx=current.current[i*4]/viewport.width*size.width + size.width/2-pointer.current.x;
      const dy=size.height/2-current.current[i*4+1]/viewport.height*size.height-pointer.current.y;
      const d=dx*dx+dy*dy;
      if(d<distance) {distance=d;pick=i;}
    }

    if(pick!==hovered.current) {
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

      // Hover feedback: smooth elevation and scale
      if(i===pick) {
        ts *= 1.38;
        tz += 0.45;
      }

      for(let k=0;k<4;k++) {
        const target=k===0?tx:k===1?ty:k===2?tz:ts, index=i*4+k;
        const diff=target-current.current[index];
        if(Math.abs(diff)>.001) unsettled=true;
        current.current[index]+=diff*factor;
      }

      dummy.position.set(current.current[i*4],current.current[i*4+1],current.current[i*4+2]);
      dummy.scale.setScalar(Math.max(.001,current.current[i*4+3]));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i,dummy.matrix);

      // Color styling per mode
      if (i === pick) {
        // Highlighting hovered martyr in warm luminous gold
        color.set('#d4af37');
      } else if (mode === 'finale') {
        // Palestinian Flag Palette for «فلسطين»: Red, Green, White, Black
        const flagTier = i % 4;
        if (flagTier === 0) {
          color.set('#e4312b'); // Palestinian Red
        } else if (flagTier === 1) {
          color.set('#149954'); // Palestinian Green
        } else if (flagTier === 2) {
          color.set('#ffffff'); // Palestinian White
        } else {
          color.set('#1e221e'); // Palestinian Black
        }
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
      } else if (mode === 'number') {
        color.set('#3a4437');
      } else {
        color.set(i % 17 === 0 ? '#586b53' : '#7d887a');
      }

      mesh.current.setColorAt(i,color);
    }

    mesh.current.instanceMatrix.needsUpdate=true;
    if(mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate=true;
    if(unsettled) invalidate();
  });
  return <instancedMesh ref={mesh} args={[geometry,material,count]} frustumCulled={false} />;
}
