export function particleRandom(i: number, salt = 0) {
  const n = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function departureField(count: number, width: number, height: number) {
  const points = new Float32Array(count * 2);
  const scales = new Float32Array(count);
  for (let i=0; i<count; i++) {
    // Share the living-register background's original positions and tiny scale.
    points[i*2] = (particleRandom(i)-.5)*width*.92;
    points[i*2+1] = (particleRandom(i,1)-.5)*height*.8*.86;
    scales[i] = .025;
  }
  return { points, scales };
}
