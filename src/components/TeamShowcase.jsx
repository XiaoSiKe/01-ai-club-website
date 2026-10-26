// Adapted from the user's TeamShowcase: staggered portraits and linked names.
// Native CSS matches the existing app; no framework migration is needed.
import { useId, useState } from 'react';
import './TeamShowcase.css';

export default function TeamShowcase({ members, headingAs: Heading = 'h4', headingContent = 'Mentor' }) {
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
        <div className="team-showcase__portraits" aria-label="导师头像">
          {[0, 1, 2].map(column => <div className={`team-showcase__column team-showcase__column--${column + 1}`} key={column}>
            {members.filter((_, i) => i % 3 === column).map(member => <button
              key={member.id} type="button" className="team-showcase__portrait"
              data-active={activeId === member.id} data-dimmed={Boolean(activeId && activeId !== member.id)}
              aria-label={`查看${member.name}介绍`} {...interact(member.id)}
            >
              {member.image ? <img src={member.image} alt={member.name} loading="lazy" decoding="async" /> : <span className="team-showcase__name-tile" aria-hidden="true">{member.name}</span>}
            </button>)}
          </div>)}
        </div>
        <div className="team-showcase__members">
          {members.map(member => <button
            key={member.id} type="button" className="team-showcase__member"
            data-active={activeId === member.id} data-dimmed={Boolean(activeId && activeId !== member.id)}
            aria-label={`${member.name}，${member.role}`} {...interact(member.id)}
          >
            <span className="team-showcase__member-name"><i aria-hidden="true" /><strong>{member.name}</strong></span>
            <span className="team-showcase__role">{member.role}</span>
            <span className="team-showcase__description">{member.description}</span>
          </button>)}
        </div>
      </div>
    </section>
  );
}
