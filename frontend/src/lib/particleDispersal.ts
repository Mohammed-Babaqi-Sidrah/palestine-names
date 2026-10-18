export function particleRandom(i: number, salt = 0) {
  const n = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

// Separate, staggered drops; their centres stay clear of each other on narrow screens.
const WIDE_DROPS = [
  [-.35,.14,.9,-.35], [-.08,.27,.75,.22], [.23,.2,1.05,.36],
  [.36,-.13,.8,-.25], [.06,-.15,1,.12], [-.25,-.27,.85,-.4], [.25,-.36,.7,.4],
];
const NARROW_DROPS = [
  [-.29,.24,.9,-.3], [.28,.28,.75,.25], [-.04,.03,1.05,.28],
  [.31,-.12,.8,-.25], [-.3,-.17,1,-.28], [.03,-.36,.85,.15], [.34,-.36,.65,.4],
];

export function bloodDropField(count: number, width: number, height: number, compact: boolean) {
  const drops = compact ? NARROW_DROPS : WIDE_DROPS;
  const points = new Float32Array(count * 2);
  const unit = Math.min(width, height) * (compact ? .125 : .095);
  for (let i=0; i<count; i++) {
    const drop = i % drops.length;
    const [cx,cy,scale,rotation] = drops[drop];
    const angle = particleRandom(i,1) * Math.PI * 2;
    // A few edge figures keep the pointed tip and rounded base legible at low counts.
    const radius = i%5 === 0 ? .96+particleRandom(i,2)*.04 : Math.sqrt(particleRandom(i,2))*.96;
    let x = Math.sin(angle)*(1-Math.cos(angle))*.5*radius*(.85+particleRandom(drop,20)*.3);
    const y = Math.cos(angle)*radius*(.9+particleRandom(drop,21)*.2);
    x += (particleRandom(drop,22)-.5)*.35*Math.max(0,y)**2;
    points[i*2] = cx*width+(x*Math.cos(rotation)-y*Math.sin(rotation))*unit*scale;
    points[i*2+1] = cy*height+(x*Math.sin(rotation)+y*Math.cos(rotation))*unit*scale;
  }
  return points;
}
