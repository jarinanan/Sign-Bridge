import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useAvatarModelStore } from '@/avatar/avatarModelStore';

const PRESETS = [
  { label: 'Remy',         url: '/remy.lite.glb' },
  { label: 'Harry Potter', url: '/ready_player_me_harry_potter.glb' },
  { label: 'Classic',      url: '/model.glb' },
];

const LocalModelPicker = () => {
  const [open, setOpen] = useState(false);
  const { modelUrl, setModelUrl } = useAvatarModelStore();

  const activeLabel =
    PRESETS.find((p) => p.url === modelUrl)?.label ??
    (modelUrl ? 'Custom' : 'Remy');

  const choose = (url) => {
    setModelUrl(url);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
        title="Switch avatar model"
      >
        <User size={12} />
        <span className="font-medium">{activeLabel}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            {PRESETS.map((p) => (
              <button
                key={p.url}
                onClick={() => choose(p.url)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  (modelUrl ?? '/remy.glb') === p.url
                    ? 'text-[#2a7e75] font-semibold bg-[#eef7f6]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LocalModelPicker;
