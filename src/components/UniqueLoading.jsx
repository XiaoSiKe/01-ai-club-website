import './UniqueLoading.css';

export default function UniqueLoading({
  variant = 'squares', size = 'md', text = 'Loading...', className = '',
}) {
  if (variant !== 'squares') return null;

  return <div className={`unique-loading unique-loading--${size} ${className}`.trim()} role="status">
    <div className="unique-loading__grid" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => <div key={index} className="unique-loading__square"
        style={{ animationDelay: `${index * 0.1}s` }} />)}
    </div>
    <span className="unique-loading__label">{text}</span>
  </div>;
}

export function PageLoading() {
  return <main className="project-loading" aria-busy="true"><UniqueLoading text="加载中" /></main>;
}
