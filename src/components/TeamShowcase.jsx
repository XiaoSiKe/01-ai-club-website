import { useLanguage } from '../Language';
// Adapted from the user's TeamShowcase: staggered portraits and linked names.
// Native CSS matches the existing app; no framework migration is needed.
import { useId, useState } from 'react';
import ResponsiveImage from './ResponsiveImage';
import './TeamShowcase.css';

export default function TeamShowcase({ members, headingAs: Heading = 'h4', headingContent = 'Mentor' }) {
  const { t } = useLanguage();
  const id = useId();
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const activeId = hoveredId || selectedId;
  const interact = memberId => ({
    onPointerEnter: () => setHoveredId(memberId),
    onPointerLeave: () => setHoveredId(null),
    onFocus: () => setHoveredId(memberId),
    onBlur: () => setHoveredId(null),
    onClick: () => setSelectedId(current => current === memberId ? null : memberId),
    'aria-pressed': selectedId === memberId,
  });

  return (
    <section className="team-showcase" aria-labelledby={`${id}-title`}>
      <Heading id={`${id}-title`} className="team-showcase__title">{headingContent}</Heading>
      <div className="team-showcase__layout">
        <div className="team-showcase__portraits" aria-label={t("导师头像")}>
          {[0, 1, 2].map(column => <div className={`team-showcase__column team-showcase__column--${column + 1}`} key={column}>
            {members.filter((_, i) => i % 3 === column).map(member => <button
              key={member.id} type="button" className="team-showcase__portrait"
              data-active={activeId === member.id} data-dimmed={Boolean(activeId && activeId !== member.id)}
              aria-label={t("查看{0}介绍", [member.name])} {...interact(member.id)}
            >
              {member.image ? <ResponsiveImage src={member.image} alt={t(member.name)} fit="cover" /> : <span className="team-showcase__name-tile" aria-hidden="true">{t(member.name)}</span>}
            </button>)}
          </div>)}
        </div>
        <div className="team-showcase__members">
          {members.map(member => <button
            key={member.id} type="button" className="team-showcase__member"
            data-active={activeId === member.id} data-dimmed={Boolean(activeId && activeId !== member.id)}
            aria-label={t("{0}，{1}", [member.name, member.role])} {...interact(member.id)}
          >
            <span className="team-showcase__member-name"><i aria-hidden="true" /><strong>{t(member.name)}</strong></span>
            <span className="team-showcase__role">{t(member.role)}</span>
            <span className="team-showcase__description">{t(member.description)}</span>
          </button>)}
        </div>
      </div>
    </section>
  );
}
