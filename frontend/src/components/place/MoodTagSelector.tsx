import { MOOD_TAGS } from '../../types';

interface MoodTagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function MoodTagSelector({ selected, onChange }: MoodTagSelectorProps) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
            selected.includes(tag)
              ? 'bg-brand text-white border-brand shadow-xs scale-105'
              : 'bg-surface text-muted border-border hover:border-brand/40 hover:text-gray-700'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
