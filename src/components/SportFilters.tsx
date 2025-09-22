interface SportFiltersProps {
  modalidades: string[];
}

export function SportFilters({ modalidades }: SportFiltersProps) {
  return (
    <div className="border-b border-glass-border glass">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {modalidades.slice(0, 12).map((modalidade) => (
            <button
              key={modalidade}
              className="flex-shrink-0 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/20 hover:backdrop-blur-sm rounded-full border border-glass-border hover:border-foreground/50 transition-all"
            >
              {modalidade}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}