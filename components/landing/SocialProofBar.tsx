const stats = [
  { value: '500+', label: 'estabelecimentos' },
  { value: '1M+', label: 'pedidos processados' },
  { value: '4.9★', label: 'avaliação média' },
];

export function SocialProofBar() {
  return (
    <div className="bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-2xl font-bold text-[var(--color-primary)]">{s.value}</span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
