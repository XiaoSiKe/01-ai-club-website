"""Create a branch flag from the existing outlined club artwork (FIT by default).

The logo and main wordmark retain the supplied template paths. New branch
lettering is outlined before export, so both SVG and PDF remain font-independent.
Requires PyMuPDF, FontTools and ReportLab.
"""
import argparse
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

import pymupdf
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTCollection, TTFont
from reportlab.lib.colors import toColor
from reportlab.pdfgen import canvas

parser = argparse.ArgumentParser()
parser.add_argument('--template-pdf', type=Path)
parser.add_argument('--branch-name', default='福州理工分社')
parser.add_argument('--branch-code', default='FIT')
parser.add_argument('--pdf', type=Path, required=True)
parser.add_argument('--svg', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
template = json.loads((root / 'src/data/branch-flags.json').read_text())['fuzc' if args.template_pdf else 'fit']
_, _, width, height = map(float, template['viewBox'].split())
if args.template_pdf:
    with pymupdf.open(args.template_pdf) as source:
        drawings = source[0].get_drawings()
    assert len(drawings) == len(template['paths']), 'Template PDF must match its extracted paths'

def union(rectangles):
    result = pymupdf.Rect(rectangles[0])
    for rectangle in rectangles[1:]:
        result |= rectangle
    return result

if args.template_pdf:
    branch_box = union([d['rect'] for d in drawings if 400 < d['rect'].y0 < 450 and d['rect'].height > 5])
    footer_box = union([d['rect'] for d in drawings if d['rect'].y0 > 460 and d['rect'].height > 2])
    paths = [dict(path) for path, drawing in zip(template['paths'], drawings) if drawing['rect'].y0 < 400]
else:
    # The bundled FIT flag preserves the original 36 brand paths, followed by
    # outlined branch lettering. Reuse it without needing an external source PDF.
    paths = [dict(path) for path in template['paths'][:36]]
    branch_box = pymupdf.Rect(0, 414, width, 438)
    footer_box = pymupdf.Rect(0, 475, width, 486.2582)
brand_path_count = len(paths)

def outline(text, font, size, tracking, center_y):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    entries, bounds, cursor = [], [], 0
    for character in text:
        if ord(character) not in cmap:
            raise ValueError(f'Font does not contain {character!r}')
        name = cmap[ord(character)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        box_pen = BoundsPen(glyphs)
        glyphs[name].draw(box_pen)
        if box_pen.bounds:
            x0, y0, x1, y1 = box_pen.bounds
            bounds.append(pymupdf.Rect(cursor + x0 * scale, -y1 * scale, cursor + x1 * scale, -y0 * scale))
            entries.append((pen.getCommands(), cursor))
        cursor += font['hmtx'].metrics[name][0] * scale + tracking
    box = union(bounds)
    shift_x = width / 2 - (box.x0 + box.x1) / 2
    baseline = center_y - (box.y0 + box.y1) / 2
    for data, x in entries:
        paths.append({'d': data, 'fill': '#fafafa', 'transform': f'matrix({scale},0,0,{-scale},{x + shift_x},{baseline})'})
    return pymupdf.Rect(box.x0 + shift_x, box.y0 + baseline, box.x1 + shift_x, box.y1 + baseline)

cjk = TTCollection('/System/Library/Fonts/STHeiti Medium.ttc').fonts[1]
latin = TTFont('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
outline(args.branch_name, cjk, 26, 6.5, (branch_box.y0 + branch_box.y1) / 2)
footer_y = (footer_box.y0 + footer_box.y1) / 2
footer = outline(f'01 AI CLUB · {args.branch_code} BRANCH', latin, 16, .8, footer_y)
for start, end in [(footer.x0 - 44, footer.x0 - 16), (footer.x1 + 16, footer.x1 + 44)]:
    paths.append({'d': f'M{start} {footer_y}H{end}', 'fill': 'none', 'stroke': '#fafafa', 'strokeWidth': '1.1'})

svg = ET.Element('svg', {'xmlns': 'http://www.w3.org/2000/svg', 'viewBox': template['viewBox'], 'width': str(width), 'height': str(height)})
ET.SubElement(svg, 'title').text = f'零一 AI 日新社｜{args.branch_name}旗帜'
for attributes in paths:
    ET.SubElement(svg, 'path', {re.sub(r'[A-Z]', lambda m: '-' + m[0].lower(), key): str(value) for key, value in attributes.items()})
args.svg.parent.mkdir(parents=True, exist_ok=True)
args.svg.write_bytes(ET.tostring(svg, encoding='utf-8', xml_declaration=True))

class CanvasPen(BasePen):
    def __init__(self, path):
        super().__init__(None)
        self.path = path
    def _moveTo(self, p): self.path.moveTo(*p)
    def _lineTo(self, p): self.path.lineTo(*p)
    def _curveToOne(self, p1, p2, p3): self.path.curveTo(*p1, *p2, *p3)
    def _qCurveToOne(self, p1, p2):
        p0 = self._getCurrentPoint()
        a = tuple(p0[i] + (p1[i] - p0[i]) * 2 / 3 for i in range(2))
        b = tuple(p2[i] + (p1[i] - p2[i]) * 2 / 3 for i in range(2))
        self.path.curveTo(*a, *b, *p2)
    def _closePath(self): self.path.close()
    def _endPath(self): pass

args.pdf.parent.mkdir(parents=True, exist_ok=True)
pdf = canvas.Canvas(str(args.pdf), pagesize=(width, height), pageCompression=1)
pdf.setTitle(f'零一 AI 日新社｜{args.branch_name}旗帜')
pdf.setAuthor('零一 AI 日新社')
pdf.setSubject('RGB vector flag; 3:2 layout; all lettering outlined')
pdf.translate(0, height)
pdf.scale(1, -1)
for attributes in paths:
    pdf.saveState()
    if transform := attributes.get('transform'):
        match = re.fullmatch(r'matrix\(([^)]+)\)', transform)
        if not match: raise ValueError(f'Unsupported transform: {transform}')
        pdf.transform(*map(float, re.split(r'[,\s]+', match[1])))
    fill, stroke = attributes.get('fill', '#000'), attributes.get('stroke', 'none')
    if fill != 'none': pdf.setFillColor(toColor(fill))
    if stroke != 'none':
        pdf.setStrokeColor(toColor(stroke))
        pdf.setLineWidth(float(attributes.get('strokeWidth', 1)))
        pdf.setLineCap({'butt': 0, 'round': 1, 'square': 2}.get(attributes.get('strokeLinecap'), 0))
        pdf.setLineJoin({'miter': 0, 'round': 1, 'bevel': 2}.get(attributes.get('strokeLinejoin'), 0))
    drawing = pdf.beginPath()
    parse_path(attributes['d'], CanvasPen(drawing))
    pdf.drawPath(drawing, fill=int(fill != 'none'), stroke=int(stroke != 'none'), fillMode=0 if attributes.get('fillRule') == 'evenodd' else 1)
    pdf.restoreState()
pdf.showPage()
pdf.save()
with pymupdf.open(args.pdf) as document:
    assert len(document) == 1 and not document[0].get_images()
    assert not document[0].get_text().strip(), 'All lettering must remain outlined'
print(f'Created PDF/SVG: {len(paths)} vector paths; {brand_path_count} original brand paths preserved')
