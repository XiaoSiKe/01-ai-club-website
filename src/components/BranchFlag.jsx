import flags from '../data/branch-flags.json';
import './BranchFlag.css';

export default function BranchFlag({ branch }) {
  const flag = flags[branch.id];
  if (!flag) return null;
  return <figure className="branch-flag">
    <svg viewBox={flag.viewBox} fill="#000" role="img" aria-label={`${branch.school}${branch.role === '总社' ? '总社' : branch.name}旗帜`}>
      {flag.paths.map((attributes, index) => <path key={index} {...attributes} />)}
    </svg>
  </figure>;
}
