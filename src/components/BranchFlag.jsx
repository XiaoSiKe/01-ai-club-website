import { useLanguage } from '../Language';
import flags from '../data/branch-flags.json';
import './BranchFlag.css';

export default function BranchFlag({ branch }) {
  const { t } = useLanguage();
  const flag = flags[branch.id];
  if (!flag) return null;
  return <figure className="branch-flag">
    <svg viewBox={flag.viewBox} fill="#000" role="img" aria-label={t("{0}{1}旗帜", [branch.school, branch.role === '总社' ? '总社' : branch.name])}>
      {flag.paths.map((attributes, index) => <path key={index} {...attributes} />)}
    </svg>
  </figure>;
}
