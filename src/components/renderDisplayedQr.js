// Render the visible QR crop and its CSS treatment at source resolution.
// Pixel filters also work in browsers without CanvasRenderingContext2D.filter.
function applyFilters(context, width, height, filter) {
  const operations = [...filter.matchAll(/(grayscale|invert|contrast|brightness)\(([\d.]+)(%)?\)/g)]
    .map(([, name, value, percent]) => [name, Number(value) / (percent ? 100 : 1)]);
  if (!operations.length) return;
  const pixels = context.getImageData(0, 0, width, height);
  const clamp = value => Math.max(0, Math.min(255, value));
  for (let i = 0; i < pixels.data.length; i += 4) {
    let r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
    for (const [name, amount] of operations) {
      if (name === 'grayscale') {
        const gray = r * .2126 + g * .7152 + b * .0722;
        r += (gray - r) * amount; g += (gray - g) * amount; b += (gray - b) * amount;
      } else if (name === 'invert') {
        r = r * (1 - amount) + (255 - r) * amount;
        g = g * (1 - amount) + (255 - g) * amount;
        b = b * (1 - amount) + (255 - b) * amount;
      } else if (name === 'contrast') {
        r = (r - 127.5) * amount + 127.5; g = (g - 127.5) * amount + 127.5; b = (b - 127.5) * amount + 127.5;
      } else {
        r *= amount; g *= amount; b *= amount;
      }
      r = clamp(r); g = clamp(g); b = clamp(b);
    }
    pixels.data[i] = r; pixels.data[i + 1] = g; pixels.data[i + 2] = b;
  }
  context.putImageData(pixels, 0, 0);
}

function clipLogo(context, clipPath, width, height) {
  const inset = clipPath.match(/^inset\(([\d.]+)% round ([\d.]+)%\)$/);
  if (!inset) return;
  const x = width * Number(inset[1]) / 100, y = height * Number(inset[1]) / 100;
  const right = width - x, bottom = height - y, radius = Math.min(width, height) * Number(inset[2]) / 100;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(right, y, right, bottom, radius);
  context.arcTo(right, bottom, x, bottom, radius);
  context.arcTo(x, bottom, x, y, radius);
  context.arcTo(x, y, right, y, radius);
  context.closePath();
  context.clip();
}

export default async function renderDisplayedQr(media, fallbackSource) {
  const layers = await Promise.all([...media.querySelectorAll('img')].map(async element => {
    const source = new Image();
    source.src = element.currentSrc || fallbackSource;
    await source.decode();
    return { element, source };
  }));
  const bounds = media.getBoundingClientRect();
  const first = layers[0].element.getBoundingClientRect();
  const scale = layers[0].source.naturalWidth / first.width;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bounds.width * scale);
  canvas.height = Math.round(bounds.height * scale);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  for (const { element, source } of layers) {
    const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
    const layer = document.createElement('canvas');
    layer.width = canvas.width; layer.height = canvas.height;
    const paint = layer.getContext('2d', { willReadFrequently: true });
    paint.drawImage(source, (rect.left - bounds.left) * scale, (rect.top - bounds.top) * scale, rect.width * scale, rect.height * scale);
    applyFilters(paint, layer.width, layer.height, style.filter);
    context.save();
    clipLogo(context, style.clipPath, canvas.width, canvas.height);
    context.drawImage(layer, 0, 0);
    context.restore();
  }
  applyFilters(context, canvas.width, canvas.height, getComputedStyle(media).filter);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('QR export failed')), 'image/png'));
  return { image: URL.createObjectURL(blob), aspectRatio: canvas.width / canvas.height };
}
