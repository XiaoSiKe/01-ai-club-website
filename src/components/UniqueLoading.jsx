import './UniqueLoading.css';

export default function UniqueLoading({
  size = 'md', text = '加载中', className = '',
}) {
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

export function LoadingSlot() {
  return <div className="loading-slot" aria-busy="true"><UniqueLoading /></div>;
}
