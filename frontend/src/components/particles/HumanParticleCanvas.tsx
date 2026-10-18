'use client';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import HumanInstancedMesh from './HumanInstancedMesh';
import { useParticleStore } from '@/lib/particleStore';
import { particleQuality } from '@/lib/particleQuality';
class CanvasBoundary extends Component<{children: ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch() { useParticleStore.setState({webglReady:false}); }
  render() { return this.state.failed?null:this.props.children; }
}
export default function HumanParticleCanvas() {
  const record=useParticleStore(s=>s.hoveredRecord);
  const pos=useParticleStore(s=>s.hoveredScreenPos);
  const reduced=useParticleStore(s=>s.reducedMotion);
  const records=useParticleStore(s=>s.records);
  const visible=useParticleStore(s=>s.stageVisible);
  const calligraphyReady=useParticleStore(s=>s.calligraphyReady);
  const mode=useParticleStore(s=>s.mode);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => {
      if (!stage.current) return;
      const state = useParticleStore.getState();
      stage.current.setAttribute('data-center-y', String(state.stageY));
      const footer = state.mode === 'finale' ? document.querySelector('.archive-colophon')?.getBoundingClientRect() : null;
      stage.current.style.clipPath = footer ? `inset(0px 0px ${Math.max(0, window.innerHeight-footer.top)}px 0px)` : '';
    };
    sync();
    // Position updates go straight to the renderer; avoid reconfiguring Canvas on every scroll.
    return useParticleStore.subscribe((s,prev) => { if (s.stageY !== prev.stageY || s.scrollY !== prev.scrollY || s.mode !== prev.mode) sync(); });
  }, []);
  const [quality] = useState(() => particleQuality(window.innerWidth));
  const [supported] = useState(() => {
    try {
      const context = document.createElement('canvas').getContext('webgl2');
      if (context) { context.getExtension('WEBGL_lose_context')?.loseContext(); return true; }
    } catch { /* Core archive remains usable without WebGL. */ }
    return false;
  });
  useEffect(()=>{document.documentElement.dataset.reducedMotion=String(reduced);},[reduced]);
  return <>
    <div ref={stage} id="human-particle-canvas" data-scene={mode} aria-hidden="true" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:visible && (mode !== 'finale' || calligraphyReady) ? 1 : 0}}>
      {supported && records.length > 0 && <CanvasBoundary><Canvas orthographic frameloop="demand" dpr={[1,quality.dpr]} camera={{position:[0,0,100],zoom:100,near:.1,far:200}} gl={{antialias:quality.fps>30,alpha:true,powerPreference:'low-power'}} onCreated={({gl,invalidate})=>{
        useParticleStore.setState({webglReady:true});
        gl.domElement.addEventListener('webglcontextlost',()=>useParticleStore.setState({webglReady:false}));
        gl.domElement.addEventListener('webglcontextrestored',()=>{useParticleStore.setState({webglReady:true});invalidate();});
      }} fallback={null}><HumanInstancedMesh /></Canvas></CanvasBoundary>}
    </div>
    <div className="canvas-scrim" aria-hidden="true" />
    {record && pos && pos.x > 0 && pos.y > 0 && (
      <aside
        className="particle-memorial-pill"
        style={{
          left: `${Math.max(156, Math.min(window.innerWidth - 156, pos.x))}px`,
          top: `${Math.max(150, pos.y - 14)}px`,
        }}
        aria-live="polite"
      >
        <span className="pill-dot" aria-hidden="true" />
        <strong className="pill-name">{record.ar_name || record.en_name}</strong>
        {record.age !== null && record.age !== undefined && (
          <span className="pill-age">
            {record.age === 0 ? 'رضيع' : `${record.age} عاماً`}
          </span>
        )}
      </aside>
    )}
  </>;
}
