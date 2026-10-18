export function particleRandom(i: number, salt = 0) {
  const n = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

// Staggered birds leave open reading space, including on narrow screens.
const WIDE_FLOCK = [
  [-.35,.14,.9,-.35], [-.08,.27,.75,.22], [.23,.2,1.05,.36],
  [.36,-.13,.8,-.25], [.06,-.15,1,.12], [-.25,-.27,.85,-.4], [.25,-.36,.7,.4],
];
const NARROW_FLOCK = [
  [-.29,.24,.9,-.3], [.28,.28,.75,.25], [-.04,.03,1.05,.28],
  [.31,-.12,.8,-.25], [-.3,-.17,1,-.28], [.03,-.36,.85,.15], [.34,-.36,.65,.4],
];

export function departureField(count: number, width: number, height: number, compact: boolean, birds: boolean) {
  const points = new Float32Array(count * 2);
  const scales = new Float32Array(count);
  const unit = Math.min(width, height);
  const centres = birds ? (compact ? NARROW_FLOCK : WIDE_FLOCK) : compact
    ? [[-.27,.23],[.26,.17],[-.1,-.03],[.27,-.27],[-.27,-.30]]
    : [[-.30,.17],[-.1,-.25],[.12,.23],[.31,-.18],[.02,-.02]];
  for (let i=0; i<count; i++) {
    const group = i % centres.length;
    const [cx,cy,scale,rotation] = centres[group];
    let x: number, y: number;
    if (birds) {
      const part = particleRandom(i,1), t = particleRandom(i,2), thickness = particleRandom(i,3);
      if (part < .14) { x = (t-.5)*.1; y = thickness*.42-.32; }
      else if (part < .2) { x = (t-.5)*.2*(1-thickness); y = -.3-thickness*.18; }
      else {
        x = (part < .6 ? -1 : 1)*(.05+t*.95);
        y = (.65+particleRandom(group,20)*.35)*Math.sin(t*Math.PI*.85)-.12*t
          +(thickness-.5)*(.02+.18*(1-t));
      }
      const span = unit*(compact ? .13 : .11)*scale;
      points[i*2] = cx*width+(x*Math.cos(rotation)-y*Math.sin(rotation))*span;
      points[i*2+1] = cy*height+(x*Math.sin(rotation)+y*Math.cos(rotation))*span;
      scales[i] = .055+particleRandom(i,4)*.015;
    } else {
      // Soft radial density, without a rectangular edge or a connected ribbon.
      const radius = Math.min(2.3,Math.sqrt(-2*Math.log(Math.max(.0001,particleRandom(i,1)))))*unit*.075;
      const angle = particleRandom(i,2)*Math.PI*2;
      x = Math.cos(angle)*radius; y = Math.sin(angle)*radius;
      points[i*2] = cx*width+x;
      points[i*2+1] = cy*height+y;
      scales[i] = .04+particleRandom(i,4)*.045;
    }
  }
  return { points, scales };
}
