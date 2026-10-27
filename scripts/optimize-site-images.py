#!/usr/bin/env python3
"""Resize website rasters for their display roles; requires Pillow.

Run explicitly with --apply. Original bytes and the per-file report stay in
ignored output/, and QR codes and full-resolution certificates are preserved.
"""
import argparse
import hashlib
import io
import json
import re
import shutil
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / 'output/image-optimization/report.json'
BACKUP = ROOT / 'output/image-originals'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def limit(path):
    name = path.as_posix()
    if any(token in name for token in ('qr', 'wechat')) or path.suffix.lower() == '.ico':
        return None
    if '/competition/certificate-' in name and '-thumb' not in name:
        return None
    if '/activity-photos/' in name: return 960
    if '/mentors/' in name: return 640
    if '/pioneers' in name or '/business-members' in name: return 480
    if '/competition/' in name: return 480 if '-thumb' in name else 1600
    if '/branches/' in name: return 256 if 'crest' in name else 960
    if '/partners/' in name or 'logo' in path.name: return 512
    if path.name.startswith('business-'): return 768
    return 960

def inventory():
    result = []
    for p in sorted((ROOT / 'public').rglob('*')):
        if p.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp', '.ico'}: continue
        with Image.open(p) as image:
            result.append({'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size,
                           'width': image.width, 'height': image.height})
    return result

def totals(rows):
    return {'files': len(rows), 'bytes': sum(r['bytes'] for r in rows),
            'rgbaBytes': sum(r['width'] * r['height'] * 4 for r in rows)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    before = inventory()
    prior = json.loads(REPORT.read_text()) if REPORT.exists() else {}
    completed = {r['path']: r['afterHash'] for r in prior.get('changed', [])}
    changes = []
    for row in before:
        p = ROOT / row['path']
        edge = limit(p)
        if edge is None or completed.get(row['path']) == digest(p): continue
        with Image.open(p) as original:
            if getattr(original, 'is_animated', False): continue
            image = ImageOps.exif_transpose(original)
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS, reducing_gap=3)
            resized = image.size != original.size
            if not resized and original.format == 'WEBP': continue
            buffer = io.BytesIO()
            options = {'icc_profile': original.info['icc_profile']} if original.info.get('icc_profile') else {}
            if original.format == 'JPEG':
                image.convert('RGB').save(buffer, 'JPEG', quality=84, optimize=True, progressive=True, **options)
            elif original.format == 'PNG':
                image.save(buffer, 'PNG', optimize=True, **options)
            else:
                image.save(buffer, 'WEBP', quality=84, method=6, **options)
            data = buffer.getvalue()
            if len(data) >= row['bytes'] and not resized: continue
            change = {**row, 'afterBytes': len(data), 'afterWidth': image.width, 'afterHeight': image.height,
                      'afterHash': hashlib.sha256(data).hexdigest()}
            changes.append(change)
            if args.apply:
                backup = BACKUP / row['path']
                backup.parent.mkdir(parents=True, exist_ok=True)
                if backup.exists() and digest(backup) != digest(p):
                    backup = backup.with_name(f'{backup.stem}.{digest(p)[:10]}{backup.suffix}')
                if not backup.exists(): shutil.copy2(p, backup)
                p.write_bytes(data)
    report = {'before': prior.get('before', totals(before)), 'after': totals(inventory()), 'changed': changes}
    if args.apply:
        activity = ROOT / 'src/data/activity-photos.js'
        def dimensions(match):
            with Image.open(ROOT / 'public' / match[2].lstrip('/')) as image:
                return f'{match[1]}{image.width}{match[3]}{image.height}'
        content = activity.read_text()
        updated = re.sub(r"(src: '(/images/activity-photos/[^']+)', width: )\d+(, height: )\d+", dimensions, content)
        if updated != content: activity.write_text(updated)
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        # Preserve hashes so a repeat run never recompresses an unchanged image.
        latest = {r['path']: r for r in prior.get('changed', [])}
        latest.update({r['path']: r for r in changes})
        report['changed'] = list(latest.values())
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({**report, 'changed': len(changes)}, ensure_ascii=False))

if __name__ == '__main__': main()
