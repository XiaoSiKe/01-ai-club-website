#!/usr/bin/env python3
"""Generate display-sized WebP assets without changing originals; requires Pillow.

Outputs are committed so CI and production need neither Python nor an image CDN.
Content hashes let the existing /assets/ immutable cache serve repeat visits.
"""
import hashlib
import io
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/assets/images'
MANIFEST = ROOT / 'src/data/image-assets.json'


def widths(path):
    name = path.as_posix()
    if 'qr' in name or 'wechat' in name:
        return ()  # Preserve every QR pixel, including the supplied center logo.
    if '/activity-photos/' in name: return (320, 640)
    if '/competition/' in name:
        return (240, 480) if '-thumb' in name else (640, 1280, 1920, 2200)
    if '/mentors/' in name: return (192, 256, 384, 640)
    if '/pioneers' in name or '/business-members' in name: return (96, 192, 256, 320, 480)
    if path.name.startswith('business-'): return (320, 384, 480, 768)
    if '/partners/' in name: return (96, 192, 320)
    if 'crest' in name: return (96, 192)
    if path.name == 'lingyi-logo.jpg': return (96, 192, 320, 480)
    if 'logo' in path.name: return (96, 192)
    return (320, 640, 960)


def generate(path):
    edges = widths(path)
    if not edges: return None
    raw = path.read_bytes()
    digest = hashlib.sha256(raw + str(edges).encode() + b'webp-v1').hexdigest()[:12]
    with Image.open(path) as source:
        if getattr(source, 'is_animated', False): return None
        image = ImageOps.exif_transpose(source)
        longest = max(image.size)
        variants = []
        for edge in sorted({min(edge, longest) for edge in edges}):
            copy = image.copy()
            copy.thumbnail((edge, edge), Image.Resampling.LANCZOS, reducing_gap=3)
            target = OUTPUT / f'{path.stem}-{digest}-{edge}.webp'
            if source.format == 'WEBP' and copy.size == source.size:
                target = path
            elif not target.exists():
                buffer = io.BytesIO()
                # Logos must keep their transparency, edges and gray gradients.
                logo = path.name.startswith('business-') or '/partners/' in path.as_posix()
                copy.save(buffer, 'WEBP', lossless=logo, quality=88 if '/competition/' in path.as_posix() else 82, method=6)
                target.write_bytes(buffer.getvalue())
            variants.append({'src': '/' + target.relative_to(ROOT / 'public').as_posix(),
                             'width': copy.width, 'height': copy.height, 'bytes': target.stat().st_size})
        return '/' + path.relative_to(ROOT / 'public').as_posix(), {
            'width': image.width, 'height': image.height,
            'sourceHash': hashlib.sha256(raw).hexdigest(), 'variants': variants,
        }


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(p for p in (ROOT / 'public').rglob('*')
                     if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'} and OUTPUT not in p.parents)
    with ThreadPoolExecutor(max_workers=4) as pool:
        assets = dict(item for item in pool.map(generate, sources) if item)
    MANIFEST.write_text(json.dumps(assets, ensure_ascii=False, separators=(',', ':')) + '\n')
    used = {ROOT / 'public' / variant['src'].lstrip('/') for asset in assets.values() for variant in asset['variants']}
    for path in OUTPUT.glob('*.webp'):
        if path not in used: path.unlink()
    # The QQ code is lossless at its original dimensions; its JPEG alternative
    # and PNG fallback no longer both need to be included in the production bundle.
    with Image.open(ROOT / 'src/assets/join-qq-qr.png') as qr:
        qr.save(ROOT / 'src/assets/join-qq-qr.webp', 'WEBP', lossless=True, method=6)
    print(json.dumps({'sources': len(assets), 'variants': len(used),
                      'bytes': sum(p.stat().st_size for p in used)}, ensure_ascii=False))


if __name__ == '__main__': main()
