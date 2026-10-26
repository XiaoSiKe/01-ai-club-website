"""Extract supplied flag PDFs as SVG paths, preserving other existing flags."""
import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET

import pymupdf

parser = argparse.ArgumentParser()
campuses = ('fzu', 'fjnu', 'fjut', 'fuzc', 'mju', 'fit')
for campus in campuses:
    parser.add_argument(f'--{campus}', type=Path)
parser.add_argument('--output', type=Path, default=Path('src/data/branch-flags.json'))
args = parser.parse_args()
if not any(getattr(args, campus) for campus in campuses):
    parser.error('provide at least one flag PDF')
flags = json.loads(args.output.read_text()) if args.output.exists() else {}
for campus in campuses:
    source = getattr(args, campus)
    if source is None:
        continue
    with pymupdf.open(source) as document:
        page = document[0]
        if page.get_images():
            raise ValueError(f'{source.name}: expected vector-only flag artwork')
        svg = ET.fromstring(page.get_svg_image(text_as_path=True))
        paths = []
        for node in svg:
            if node.tag.split('}')[-1] != 'path':
                raise ValueError(f'{source.name}: unexpected non-path SVG element')
            attributes = {}
            for name, value in node.attrib.items():
                first, *rest = name.split('-')
                attributes[first + ''.join(word.capitalize() for word in rest)] = value
            paths.append(attributes)
        flags[campus] = {'viewBox': svg.attrib['viewBox'], 'paths': paths}
        print(f'{campus}: {len(paths)} vector paths, no image elements')
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(flags, ensure_ascii=False, separators=(',', ':')) + '\n')
