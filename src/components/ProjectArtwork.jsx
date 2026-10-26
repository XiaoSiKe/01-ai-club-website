// Code-native project previews stay sharp at every size and need no remote assets.
export default function ProjectArtwork({ kind }) {
  return (
    <div className={`project-art project-art--${kind}`} aria-hidden="true">
      <div className="project-art-grid" />
      {kind === 'knowledge' && <div className="art-library">
        <div className="art-library-spine">01 / KNOWLEDGE</div>
        <div className="art-library-page"><span className="art-small">一切从好奇开始</span><strong>从零，<br />读懂 AI。</strong><div className="art-rule" /><span className="art-small">LEARN · BUILD · SHARE</span></div>
        <div className="art-library-tab">↗</div>
      </div>}
      {kind === 'study' && <div className="art-study">
        <div className="art-small">TODAY / 今天也向前一步</div>
        <div className="art-study-progress"><span>02<small> / 03</small></span><div className="art-progress-ring">↗</div></div>
        <div className="art-task"><i>✓</i><span>理解一个新概念</span></div>
        <div className="art-task"><i>✓</i><span>动手做一个小实验</span></div>
        <div className="art-task art-task--pending"><i /><span>分享今天的发现</span></div>
      </div>}
      {kind === 'studio' && <div className="art-studio">
        <div className="art-orbit art-orbit--one" /><div className="art-orbit art-orbit--two" /><div className="art-orbit art-orbit--three" />
        <span className="art-spark">✳</span><span className="art-studio-label">WHAT IF.</span><span className="art-studio-note">一个想法，无限可能。</span>
      </div>}
      {kind === 'tools' && <div className="art-tools">
        <div className="art-terminal-bar"><i /><i /><i /><span>daily-tools / json</span></div>
        <pre>{'{\n  "curiosity": true,\n  "ideas": ["learn", "build"],\n  "next": "start today"\n}'}</pre>
        <div className="art-terminal-status"><span>✓</span> 小问题，也值得一个好答案。</div>
      </div>}
      <span className="project-art-coordinate">01AI / EXPERIMENT</span>
    </div>
  );
}
