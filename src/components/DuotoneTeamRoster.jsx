"use client";
/** Adapted from the user-supplied DuotoneTeamRoster, with local placeholder portraits. */
import * as React from "react";
export const DEFAULT_LABELS = {
	team: "Team",
	openRole: "Open role",
	hiring: "Hiring",
	roleLink: "See the role",
	memberLink: "Say hello"
};
// #region roster-logic
export const PRESETS = {
	ember: {
		ground: "#170403",
		deep: "#4f0d06",
		hot: "#ee7a1c",
		glow: "#ffb54a",
		ink: "#fff0c8",
		shadow: "#260604",
		highlight: "#ffe2ad"
	},
	cobalt: {
		ground: "#03061f",
		deep: "#0d1c6e",
		hot: "#2e57f5",
		glow: "#86a6ff",
		ink: "#eef1ff",
		shadow: "#050b33",
		highlight: "#d9e3ff"
	},
	moss: {
		ground: "#061008",
		deep: "#163519",
		hot: "#5d8a35",
		glow: "#c3d66e",
		ink: "#f3f6dd",
		shadow: "#08170b",
		highlight: "#eef3c4"
	},
	mono: {
		ground: "#090909",
		deep: "#262626",
		hot: "#8c8c8c",
		glow: "#e0e0e0",
		ink: "#fafafa",
		shadow: "#0d0d0d",
		highlight: "#f4f4f4"
	}
};
export function resolvePalette(preset, overrides) {
	const table = PRESETS;
	const base = table[preset] || PRESETS.ember;
	const out = Object.assign({}, base);
	if (overrides) {
		for (const k of Object.keys(base)) if (overrides[k]) out[k] = overrides[k];
	}
	return out;
}
/** "#f80" or "#ff8800" to [r, g, b] in 0..1, for the SVG tritone tables. */
export function hexToUnit(hex) {
	let h = String(hex || "").trim().replace("#", "");
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	if (!/^[0-9a-fA-F]{6}$/.test(h)) return [
		0,
		0,
		0
	];
	return [
		0,
		2,
		4
	].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) / 255 * 1e3) / 1e3);
}
/** Mixes two hex colours, t = 0 gives a, t = 1 gives b. */
export function mixHex(a, b, t) {
	const x = hexToUnit(a);
	const y = hexToUnit(b);
	return "#" + [
		0,
		1,
		2
	].map((i) => Math.round((x[i] + (y[i] - x[i]) * t) * 255).toString(16).padStart(2, "0")).join("");
}
/** One feFuncR/G/B table per channel: shadow, midtone, highlight. */
export function tritoneTables(shadow, mid, highlight) {
	const s = hexToUnit(shadow);
	const m = hexToUnit(mid);
	const h = hexToUnit(highlight);
	return [
		0,
		1,
		2
	].map((c) => s[c] + " " + m[c] + " " + h[c]);
}
export function initials(name) {
	const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "?";
	const first = parts[0][0];
	const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
	return (first + last).toUpperCase();
}
/**
* Deals the people (and open roles) into columns round-robin, so neighbours
* differ, then pads short columns with repeats until each holds `minPerColumn`
* so a drifting loop never shows a gap. Repeats are flagged `dup` and are
* hidden from assistive tech. Open roles are spread through the deck.
*/
export function dealColumns(count, roleCount, columns, minPerColumn) {
	const cols = Math.max(1, Math.floor(columns) || 1);
	const deck = [];
	for (let i = 0; i < count; i++) deck.push({
		kind: "member",
		index: i
	});
	for (let r = 0; r < roleCount; r++) {
		const at = Math.min(deck.length, Math.round((r + 1) * (count + roleCount) / (roleCount + 1)) - 1 + r);
		deck.splice(Math.max(0, at), 0, {
			kind: "role",
			index: r
		});
	}
	const out = [];
	for (let c = 0; c < cols; c++) out.push([]);
	deck.forEach((d, i) => out[i % cols].push({
		kind: d.kind,
		index: d.index,
		dup: false
	}));
	if (!deck.length) return out;
	// Pad from the far end of the column furthest away, so a repeat never sits
	// level with the same face in the next column.
	for (let c = 0; c < cols; c++) {
		let from = (c + Math.floor(cols / 2) + (cols % 2 ? 1 : 0)) % cols;
		if (cols === 1) from = 0;
		const pool = out[from].filter((e) => !e.dup).slice().reverse();
		const rest = deck.map((d) => ({
			kind: d.kind,
			index: d.index,
			dup: false
		})).reverse();
		const candidates = pool.concat(rest);
		let k = 0;
		let guard = 0;
		while (out[c].length < minPerColumn && guard < candidates.length * 3) {
			const d = candidates[k % candidates.length];
			k++;
			guard++;
			const clash = out[c].some((e) => e.kind === d.kind && e.index === d.index);
			if (clash && guard < candidates.length) continue;
			out[c].push({
				kind: d.kind,
				index: d.index,
				dup: true
			});
		}
	}
	return out;
}
/** Font size that makes the widest headline line fill `available` px. */
export function fitTitleSize(available, widestAt100, stretch, min, max) {
	if (!(available > 0) || !(widestAt100 > 0)) return min;
	const size = available / (widestAt100 * (stretch > 0 ? stretch : 1)) * 100;
	return Math.max(min, Math.min(max, Math.floor(size * 10) / 10));
}
/** Layout for a container width: a strip on phones, 2 columns on tablets. */
export function layoutFor(width, columns) {
	if (width > 0 && width < 700) return 0;
	const wanted = Math.max(2, Math.min(4, Math.round(columns) || 3));
	if (width > 0 && width < 1e3) return 2;
	return wanted;
}
export function splitLines(title) {
	return String(title || "").split("\n").map((l) => l.trim()).filter(Boolean);
}
// #endregion roster-logic
const EMPTY_MEMBERS = [];
const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
const DISPLAY_STACK = "\"Arial Black\", \"Archivo Black\", \"Helvetica Neue\", Inter, \"Segoe UI\", system-ui, sans-serif";
import "./DuotoneTeamRoster.css";
/** Nudges a drifting column (or the phone strip) so a focused card is fully visible. */
function bringIntoView(card) {
	const frame = card.closest(".dtr-wall, .dtr-strip");
	const track = card.closest(".dtr-track, .dtr-strip-track");
	if (!frame || !track) return;
	const f = frame.getBoundingClientRect();
	const r = card.getBoundingClientRect();
	const vertical = track.classList.contains("dtr-track");
	// Start from where the track is right now (it may still be easing back).
	const now = getComputedStyle(track).translate;
	const parts = !now || now === "none" ? ["0", "0"] : now.split(" ");
	let x = parseFloat(parts[0]) || 0;
	let y = parseFloat(parts[1] || "0") || 0;
	const m = 24;
	if (vertical) {
		if (r.top < f.top + m) y += f.top + m - r.top;
		else if (r.bottom > f.bottom - m) y -= r.bottom - (f.bottom - m);
	} else {
		if (r.left < f.left + m) x += f.left + m - r.left;
		else if (r.right > f.right - m) x -= r.right - (f.right - m);
	}
	track.style.translate = Math.round(x) + "px " + Math.round(y) + "px";
}
/** Lets the track ease back into its loop once focus moves on. */
function releaseNudge(card) {
	const track = card.closest(".dtr-track, .dtr-strip-track");
	if (track) track.style.translate = "";
}
function Portrait(props) {
	const { slot, on, filterId, labels, onEnter, onLeave, onToggle, onSelect, follows } = props;
	const [failed, setFailed] = React.useState(false);
	const pointer = React.useRef("mouse");
	const panelId = "p" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
	const hidden = slot.dup;
	const hitRef = React.useRef(null);
	const close = () => { hitRef.current?.focus({ preventScroll: true }); onLeave(slot.key); };
	const isRole = slot.kind === "role";
	const member = slot.kind === "member" ? slot.member : null;
	const role = slot.kind === "role" ? slot.role : null;
	const craft = member ? member.university || "" : role ? role.craft || labels.hiring : "";
	const label = member ? [member.name, member.university].filter(Boolean).join('，') : role ? labels.openRole + ": " + role.title : "";
	const photo = member && member.photo && !failed ? member.photo : "";
	const originalColor = member?.photoPlaceholder === false;
	const href = member ? member.href : role ? role.href : undefined;
	const linkLabel = member ? member.linkLabel || labels.memberLink : role && role.linkLabel || labels.roleLink;
	const exposure = member && member.exposure && member.exposure > 0 ? member.exposure : 1;
	const focus = member && member.focus || "50% 22%";
	const followable = follows && Boolean(href) && !/^mailto:/i.test(String(href));
	const clickable = true;
	const follow = (card) => {
		const a = card.querySelector(".dtr-panel a");
		if (a) a.click();
	};
	return <div className={"dtr-card" + (isRole ? " dtr-role" : "")} id={!hidden && member?.id ? `pioneer-${member.id}` : undefined} data-member-id={member?.id} data-slot-key={slot.key} data-original-color={originalColor ? "" : undefined} data-on={on ? "" : undefined} data-click={clickable ? "" : undefined} aria-hidden={hidden ? true : undefined} style={{ ["--dtr-cw"]: Math.min(26, craft.length) * .74 + 2.2 + "em" }} onPointerDown={(e) => {
		pointer.current = e.pointerType;
	}} onPointerEnter={(e) => {
		if (e.pointerType !== "mouse" || e.currentTarget.closest('.dtr')?.hasAttribute('data-manual')) return;
		// A card cut off by the frame slides fully into view (it stays under the pointer).
		bringIntoView(e.currentTarget);
		onEnter(slot.key);
	}} onPointerLeave={(e) => {
		if (e.pointerType !== "mouse") return;
		if (e.currentTarget.contains(document.activeElement)) return;
		onLeave(slot.key);
		releaseNudge(e.currentTarget);
	}} onBlur={(e) => {
		if (e.currentTarget.contains(e.relatedTarget)) return;
		onLeave(slot.key);
		releaseNudge(e.currentTarget);
	}}>
      <div className="dtr-photo">
        {photo && originalColor ? <img className="dtr-original" src={photo} alt="" width={720} height={960} loading="lazy" decoding="async" draggable={false}
          style={{ objectPosition: focus, objectFit: member.photoFit }} onError={() => setFailed(true)} /> : photo ? <>
            <img className="dtr-duo" src={photo} alt="" width={720} height={960} loading="lazy" decoding="async" draggable={false} style={{
		filter: (exposure !== 1 ? "brightness(" + exposure + ") " : "") + "url(#" + filterId + ")",
		objectPosition: focus, objectFit: member.photoFit
	}} onError={() => setFailed(true)} />
            <img className="dtr-true" src={photo} alt="" width={720} height={960} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: focus, objectFit: member.photoFit }} />
          </> : <div className="dtr-plate" aria-hidden="true">
            <span>{member ? initials(member.name) : role && role.mark || "You?"}</span>
            {role ? <em>{role.title}</em> : null}
          </div>}
      </div>
      <span className="dtr-chip" aria-hidden="true">
        {member ? <><strong>{member.name}</strong><span>{member.university}</span></> : craft}
      </span>
      <button ref={hitRef} type="button" className="dtr-hit" tabIndex={hidden ? -1 : 0} aria-label={label} aria-expanded={hidden ? undefined : on} aria-controls={panelId} onFocus={(e) => {
		// Pointer focus is handled by hover and tap; keyboard focus unfolds here.
		if (!e.currentTarget.matches(":focus-visible")) return;
		onEnter(slot.key);
		bringIntoView(e.currentTarget.parentElement);
	}} onClick={(e) => {
		const card = e.currentTarget.parentElement;
		if (member && onSelect) onSelect(member);
		if (e.detail === 0) {
			// Keyboard: Enter opens the card, a second Enter moves to its link.
			if (!on) {
				onEnter(slot.key);
				bringIntoView(card);
			} else {
				const a = card.querySelector(".dtr-panel a");
				if (a) a.focus();
				else card.querySelector(".dtr-close")?.focus();
			}
			return;
		}
		if (pointer.current === "mouse") {
			if (followable) follow(card);
			else onEnter(slot.key);
			return;
		}
		if (!on) bringIntoView(card);
		onToggle(slot.key);
	}} onKeyDown={(e) => {
		if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
	}} />
      <div className="dtr-panel" id={panelId} aria-hidden={on ? undefined : true} onKeyDown={(e) => {
		if (e.key !== "Escape") return;
		e.preventDefault();
		e.stopPropagation();
		close();
	}}>
        <p className="dtr-name">{member ? member.name : role ? role.title : ""}</p>
        {member || role && role.note ? <p className="dtr-roleline">{member ? member.university : role ? role.note : ""}</p> : null}
        {href ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={member ? `${member.name} 的 GitHub 主页（新窗口）` : undefined} tabIndex={hidden || !on ? -1 : 0}>
            {linkLabel} <span aria-hidden="true">↗</span>
          </a> : null}
        <button type="button" className="dtr-close" tabIndex={hidden || !on ? -1 : 0} aria-label={`关闭${member ? member.name : role?.title || ""}的介绍`} onClick={close}>关闭 <span aria-hidden="true">×</span></button>
      </div>
    </div>;
}
export default function DuotoneTeamRoster({ members = EMPTY_MEMBERS, openRoles = [], eyebrow = "Meet", title = "The\ncrew", intro = "", cta = null, secondaryCta = null, preset = "ember", palette, columns = 3, driftSeconds = 9, cardScale = 1, speedMultiplier = 1, drift = true, height = "100svh", fontFamily = DISPLAY_STACK, stretch = 1.16, uppercase = true, grain = true, labels, className = "", onMemberSelect, clickFollowsLink = true, targetMemberId = null, initialMemberId = null, titleAs: Title = "h2", renderTitleLine = null }) {
	const pal = resolvePalette(preset, palette);
	const text = {
		...DEFAULT_LABELS,
		...labels || {}
	};
	const rawId = React.useId();
	const uid = "dtr" + rawId.replace(/[^a-zA-Z0-9]/g, "");
	const filterId = uid + "-tone";
	const titleId = uid + "-title";
	const rootRef = React.useRef(null);
	const copyRef = React.useRef(null);
	const titleRef = React.useRef(null);
	const appliedTargetRef = React.useRef(null);
	const appliedInitialRef = React.useRef(null);
	const [cols, setCols] = React.useState(layoutFor(0, columns));
	const [titleSize, setTitleSize] = React.useState(0);
	const [stepRatio, setStepRatio] = React.useState(1);
	const [active, setActive] = React.useState(null);
	const [reducedMotion, setReducedMotion] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	React.useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const change = () => setReducedMotion(media.matches);
		change();
		media.addEventListener("change", change);
		return () => media.removeEventListener("change", change);
	}, []);
	const [outOfView, setOutOfView] = React.useState(false);
	const [tabHidden, setTabHidden] = React.useState(false);
	const offscreen = outOfView || tabHidden;
	const lines = splitLines(title);
	// The shadow end is lifted toward the field so dark skin and dark clothes keep their detail.
	const mid = palette && palette.mid || mixHex(pal.hot, pal.highlight, .35);
	const tables = tritoneTables(mixHex(pal.shadow, pal.deep, .4), mid, mixHex(pal.highlight, pal.ink, .5));
	const still = !drift || !(driftSeconds > 0) || reducedMotion || cols === 0;
	const copies = still ? [0] : [0, 1];
	const [minPer, setMinPer] = React.useState(4);
	const plan = React.useMemo(() => dealColumns(members.length, openRoles.length, cols || 1, cols && !still ? minPer : 0), [
		members.length,
		openRoles.length,
		cols,
		minPer,
		still
	]);
	const slotFor = (e, prefix) => e.kind === "role" ? {
		key: prefix,
		kind: "role",
		role: openRoles[e.index],
		dup: e.dup
	} : {
		key: prefix,
		kind: "member",
		member: members[e.index],
		dup: e.dup
	};
	// Measure the container: choose the layout and fit the headline to its column.
	useIsoLayoutEffect(() => {
		const root = rootRef.current;
		const copy = copyRef.current;
		const head = titleRef.current;
		if (!root || !copy || !head) return;
		const fit = () => {
			const w = root.getBoundingClientRect().width;
			const next = layoutFor(w, columns);
			setCols((c) => c === next ? c : next);
			const spans = head.querySelectorAll(".dtr-line > span");
			let widest = 0;
			const cur = parseFloat(getComputedStyle(head).fontSize) || 100;
			spans.forEach((s) => {
				widest = Math.max(widest, s.offsetWidth);
			});
			const widestAt100 = widest / cur * 100;
			const cs = getComputedStyle(copy);
			const avail = copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
			const h = root.getBoundingClientRect().height;
			const strip = next === 0;
			// Enough portraits per column that one loop is taller than the wall.
			if (next > 0) {
				const wall = root.querySelector('.dtr-wall');
				const wallStyle = wall && getComputedStyle(wall);
				const gap = parseFloat(wallStyle?.columnGap) || 14;
				const wallW = wall ? wall.getBoundingClientRect().width - parseFloat(wallStyle.paddingLeft) - parseFloat(wallStyle.paddingRight) : w * .58;
				const referenceHeight = (wallW - gap * (next - 1)) / next * (4 / 3);
				const cardH = referenceHeight * cardScale + gap;
				setStepRatio(cardH / (referenceHeight + gap));
				const need = Math.max(3, Math.ceil(h / Math.max(80, cardH)));
				setMinPer((m) => m === need ? m : need);
			}
			const maxByHeight = strip ? 200 : Math.max(56, h * .52 / Math.max(1, lines.length + .45));
			// On the wall layout the widest line runs on into the first column of portraits, like a poster.
			const overhang = strip ? 1 : 1.18;
			setTitleSize(fitTitleSize(avail * overhang, widestAt100, stretch, 40, Math.min(280, maxByHeight)));
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(root);
		return () => ro.disconnect();
	}, [
		columns,
		cardScale,
		stretch,
		title,
		fontFamily,
		uppercase,
		lines.length
	]);
	// Stop drifting while nobody can see it.
	React.useEffect(() => {
		const root = rootRef.current;
		if (!root || typeof IntersectionObserver === "undefined") return;
		const io = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting), { threshold: 0 });
		io.observe(root);
		const vis = () => setTabHidden(document.hidden);
		vis();
		document.addEventListener("visibilitychange", vis);
		return () => {
			io.disconnect();
			document.removeEventListener("visibilitychange", vis);
		};
	}, []);
	const onEnter = React.useCallback((key) => setActive(key), []);
	const onLeave = React.useCallback((key) => setActive((a) => a === key ? null : a), []);
	const onToggle = React.useCallback((key) => setActive((a) => a === key ? null : key), []);
	// Seek the existing loop instead of layering another transform over it.
	// Both alternating directions then follow a downward wheel in the same way.
	React.useEffect(() => {
		const root = rootRef.current;
		const wall = root?.querySelector(cols === 0 ? '.dtr-strip' : '.dtr-wall');
		if (!wall || (still && cols !== 0)) return undefined;
		let resumeTimer;
		const resume = () => {
			root.removeAttribute('data-manual');
			wall.querySelectorAll('.dtr-track').forEach(track => track.style.removeProperty('transition'));
		};
		const wheel = event => {
			if (event.ctrlKey || !event.deltaY) return;
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? wall.clientHeight : 1;
			const delta = event.deltaY * unit;
			if (cols === 0) {
				if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
				const next = Math.max(0, Math.min(wall.scrollWidth - wall.clientWidth, wall.scrollLeft + delta));
				if (next === wall.scrollLeft) return;
				event.preventDefault();
				wall.scrollLeft = next;
				return;
			}
			const panel = event.target.closest?.('.dtr-panel');
			if (panel && ((delta > 0 && panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1) || (delta < 0 && panel.scrollTop > 0))) return;
			root.setAttribute('data-manual', '');
			const tracks = [...wall.querySelectorAll('.dtr-track')].map(track => {
				const animation = track.getAnimations().find(item => item.animationName === 'dtr-up' || item.animationName === 'dtr-down');
				const duration = Number(animation?.effect?.getTiming().duration);
				const distance = track.getBoundingClientRect().height / 2;
				const parts = (getComputedStyle(track).translate || '').split(' ');
				return { track, animation, duration, distance, nudge: parseFloat(parts[1]) || 0, down: track.parentElement.dataset.dir === 'down', time: Number(animation?.currentTime) || 0 };
			}).filter(item => item.animation && item.duration > 0 && item.distance > 0);
			if (!tracks.length) { resume(); return; }
			event.preventDefault();
			if (wall.contains(document.activeElement)) document.activeElement.blur();
			setActive(null);
			tracks.forEach(({ track, animation, duration, distance, nudge, down, time }) => {
				track.style.transition = 'none';
				track.style.translate = '0px 0px';
				const next = time + (delta - nudge) / distance * duration * (down ? -1 : 1);
				animation.currentTime = (next % duration + duration) % duration;
			});
			clearTimeout(resumeTimer);
			resumeTimer = window.setTimeout(resume, 900);
		};
		wall.addEventListener('wheel', wheel, { passive: false });
		return () => { clearTimeout(resumeTimer); wall.removeEventListener('wheel', wheel); resume(); };
	}, [cols, still]);

	// Set the opening position before paint, then let every column drift normally.
	useIsoLayoutEffect(() => {
		if (!initialMemberId || targetMemberId) return undefined;
		const root = rootRef.current;
		const frame = root?.querySelector(cols === 0 ? '.dtr-strip' : '.dtr-wall');
		if (!frame) return undefined;
		const positionInitialMember = () => {
			const card = [...frame.querySelectorAll('[data-member-id]:not([aria-hidden="true"])')].find(node => node.dataset.memberId === initialMemberId);
			if (!card) return;
			const key = `${initialMemberId}:${card.dataset.slotKey}:${cols}:${still}:${frame.clientWidth}:${frame.clientHeight}:${stepRatio}:${driftSeconds}:${speedMultiplier}:${plan.map(column => column.length).join(',')}`;
			if (appliedInitialRef.current === key) return;
			const box = frame.getBoundingClientRect();
			const portrait = card.getBoundingClientRect();
			if (cols === 0) {
				frame.scrollLeft += portrait.left + portrait.width / 2 - box.left - box.width / 2;
			} else if (still) {
				card.scrollIntoView({ block: 'center', behavior: 'instant' });
			} else {
				const track = card.closest('.dtr-track');
				const animation = track.getAnimations().find(item => item.animationName === 'dtr-up' || item.animationName === 'dtr-down');
				const duration = Number(animation?.effect?.getTiming().duration);
				const distance = track.getBoundingClientRect().height / 2;
				if (!animation || !(duration > 0) || !(distance > 0)) return;
				const delta = box.top + box.height / 2 - portrait.top - portrait.height / 2;
				const direction = track.parentElement.dataset.dir === 'down' ? 1 : -1;
				const next = (Number(animation.currentTime) || 0) + delta / distance * duration * direction;
				animation.currentTime = (next % duration + duration) % duration;
			}
			appliedInitialRef.current = key;
		};
		positionInitialMember();
		const observer = new ResizeObserver(positionInitialMember);
		observer.observe(frame);
		return () => observer.disconnect();
	}, [initialMemberId, targetMemberId, cols, still, plan, members, stepRatio, driftSeconds, speedMultiplier]);
	// A branch leader link arrives with a member ID, never a transient row index.
	useIsoLayoutEffect(() => {
		if (!targetMemberId) return undefined;
		const key = `${targetMemberId}:${cols}:${still}`;
		if (appliedTargetRef.current === key) return undefined;
		const frame = requestAnimationFrame(() => {
			const root = rootRef.current;
			const card = [...root.querySelectorAll('[data-member-id]:not([aria-hidden="true"])')].find(node => node.dataset.memberId === targetMemberId);
			if (!card) return;
			appliedTargetRef.current = key;
			if (cols === 0) {
				const strip = card.closest('.dtr-strip');
				strip.scrollLeft = card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2;
			} else if (still) {
				card.scrollIntoView({ block: 'center', behavior: 'instant' });
			} else {
				bringIntoView(card);
			}
			setActive(card.dataset.slotKey);
			card.querySelector('.dtr-hit')?.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(frame);
	}, [targetMemberId, cols, still, plan]);
	// Tap outside an unfolded card folds it again.
	React.useEffect(() => {
		if (!active) return;
		const down = (e) => {
			if (e.pointerType === "mouse") return;
			const t = e.target;
			if (!t || !t.closest || !t.closest(".dtr-card")) setActive(null);
		};
		document.addEventListener("pointerdown", down);
		return () => document.removeEventListener("pointerdown", down);
	}, [active]);
	const rootStyle = {
		["--dtr-ground"]: pal.ground,
		["--dtr-deep"]: pal.deep,
		["--dtr-hot"]: pal.hot,
		["--dtr-glow"]: pal.glow,
		["--dtr-ink"]: pal.ink,
		["--dtr-display"]: fontFamily,
		["--dtr-stretch"]: String(stretch),
		["--dtr-case"]: uppercase ? "uppercase" : "none",
		["--dtr-cols"]: String(cols || 1),
		["--dtr-card-scale"]: String(cardScale),
		["--dtr-ts"]: titleSize ? titleSize + "px" : undefined,
		["--dtr-sdur"]: Math.max(8, (members.length + openRoles.length) * Math.max(1, driftSeconds) * .55) + "s",
		["--dtr-h"]: height,
		height: cols === 0 || still ? "auto" : height,
		minHeight: cols === 0 ? undefined : still ? height : "600px"
	};
	const phases = [
		0,
		.38,
		.71,
		.18
	];
	return <section ref={rootRef} className={"dtr " + className} style={rootStyle} aria-labelledby={titleId} data-mode={cols === 0 ? "strip" : "columns"} data-cols={cols || undefined} data-active={active ? "" : undefined} data-active-col={active && cols !== 0 ? active.split("-")[0] : undefined} data-linked={targetMemberId ? "" : undefined} data-initial-member={!targetMemberId ? initialMemberId : undefined} data-static={still ? "" : undefined} data-offscreen={offscreen ? "" : undefined}>
      <svg className="dtr-defs" aria-hidden="true" focusable="false">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.13 0.5 0.9 1" />
            <feFuncG type="table" tableValues="0 0.13 0.5 0.9 1" />
            <feFuncB type="table" tableValues="0 0.13 0.5 0.9 1" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={tables[0]} />
            <feFuncG type="table" tableValues={tables[1]} />
            <feFuncB type="table" tableValues={tables[2]} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="dtr-field" aria-hidden="true" />
      {grain ? <div className="dtr-grain" aria-hidden="true" /> : null}

      <div className="dtr-in">
        <div className="dtr-copy" ref={copyRef}>
          <Title className="dtr-title" id={titleId} ref={titleRef}>
            {eyebrow ? <span className="dtr-eyebrow">{eyebrow} </span> : null}
            {lines.map((l, i) => <span className="dtr-line" key={i} style={{ ["--i"]: i }}>
                <span>
                  {renderTitleLine ? renderTitleLine(l, i) : <span>{l}</span>}
                </span>
                {i < lines.length - 1 ? " " : null}
              </span>)}
          </Title>
          {intro ? <p className="dtr-intro">{intro}</p> : null}
          {cta || secondaryCta ? <div className="dtr-actions">
              {cta ? <a className="dtr-cta" href={cta.href}>
                  <span className="dtr-cta-label">
                    <span>{cta.label}</span>
                    <span aria-hidden="true">{cta.label}</span>
                  </span>
                  <span className="dtr-cta-arrow" aria-hidden="true">
                    →
                  </span>
                </a> : null}
              {secondaryCta ? <a className="dtr-link" href={secondaryCta.href}>
                  {secondaryCta.label}
                </a> : null}
            </div> : null}
        </div>

        {cols === 0 ? <div className="dtr-strip" role="group" aria-label={text.team}>
            <div className="dtr-strip-track">
              {copies.map((copy) => plan[0].map((e, i) => {
		const slot = slotFor({
			...e,
			dup: e.dup || copy === 1
		}, "s" + copy + "-" + i);
		return <Portrait key={slot.key} slot={slot} on={active === slot.key} filterId={filterId} labels={text} onEnter={onEnter} onLeave={onLeave} onToggle={onToggle} onSelect={onMemberSelect} follows={clickFollowsLink} />;
	}))}
            </div>
          </div> : <div className="dtr-wall" role="group" aria-label={text.team}>
            {plan.map((col, c) => {
		const dur = Math.max(6, col.length * Math.max(1, driftSeconds)) * stepRatio / Math.max(.1, speedMultiplier);
		const phase = phases[c % phases.length];
		return <div className="dtr-col" key={c} data-dir={c % 2 ? "down" : "up"} style={{
			["--ci"]: c,
			["--dtr-dur"]: dur + "s",
			["--dtr-phase"]: -(dur * phase) + "s",
			["--dtr-rest"]: c % 2 ? 1 - phase : phase
		}}>
                  <div className="dtr-track">
                    {copies.map((copy) => col.map((e, i) => {
			const slot = slotFor({
				...e,
				dup: e.dup || copy === 1
			}, c + "-" + copy + "-" + i);
			return <div key={slot.key}>
                            <Portrait slot={slot} on={active === slot.key} filterId={filterId} labels={text} onEnter={onEnter} onLeave={onLeave} onToggle={onToggle} onSelect={onMemberSelect} follows={clickFollowsLink} />
                          </div>;
		}))}
                  </div>
                </div>;
	})}
          </div>}
      </div>
    </section>;
}
