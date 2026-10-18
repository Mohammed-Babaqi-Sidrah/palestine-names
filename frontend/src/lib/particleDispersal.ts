export function particleRandom(i: number, salt = 0) {
  const n = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function departureField(count: number, width: number, height: number) {
  const points = new Float32Array(count * 2);
  const scales = new Float32Array(count);
  for (let i=0; i<count; i++) {
    // Unbounded soft density: no motif, clusters or straight box edges.
    // Cache once so the same souls retrace their paths when scrolling back.
    const radius = Math.sqrt(-2*Math.log(Math.max(.0001,particleRandom(i,1))));
    const angle = particleRandom(i,2)*Math.PI*2;
    points[i*2] = Math.cos(angle)*radius*width*.24;
    points[i*2+1] = Math.sin(angle)*radius*height*.22;
    scales[i] = .04+particleRandom(i,4)*.045;
  }
  return { points, scales };
}
