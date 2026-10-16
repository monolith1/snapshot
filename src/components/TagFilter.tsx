interface Props {
  tags: { tag: string; count: number }[];
  active: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

/** Horizontally scrolling tag chips — filters which pins are shown. */
export default function TagFilter({ tags, active, onToggle, onClear }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <button
        type="button"
        onClick={onClear}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition ${
          active.length === 0
            ? 'border-paper bg-paper text-ink'
            : 'border-white/10 bg-ink/70 text-paper/80 hover:border-white/30'
        }`}
      >
        All
      </button>
      {tags.map(({ tag, count }) => {
        const on = active.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            aria-pressed={on}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs backdrop-blur-md transition ${
              on
                ? 'border-accent bg-accent text-ink font-medium'
                : 'border-white/10 bg-ink/70 text-paper/80 hover:border-white/30'
            }`}
          >
            {tag}
            <span className={`ml-1.5 tabular-nums ${on ? 'text-ink/60' : 'text-mute'}`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
