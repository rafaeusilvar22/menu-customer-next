export function HeroSection() {
  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="animate-fade-in-up">
            <span className="inline-block bg-orange-50 text-[var(--color-primary)] text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Cardápio digital para restaurantes
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-secondary)] leading-tight mb-5">
              Seu cardápio digital{' '}
              <span className="text-[var(--color-primary)]">em minutos</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Crie seu menu online, receba pedidos e gerencie seu negócio de qualquer lugar. Sem mensalidade presa, sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="bg-[var(--color-primary)] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[var(--color-emphasis)] transition-colors shadow-md shadow-orange-200 text-center"
              >
                Criar cardápio grátis
              </a>
              <a
                href="#como-funciona"
                className="border border-gray-200 text-gray-700 font-medium px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
              >
                Como funciona →
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Sem cartão de crédito. Grátis para começar.</p>
          </div>

          {/* Visual mockup */}
          <div className="animate-fade-in" style={{ animationDelay: '120ms' }}>
            <div className="relative">
              {/* Browser chrome */}
              <div className="bg-gray-100 rounded-2xl shadow-2xl shadow-gray-200 overflow-hidden border border-gray-200">
                {/* Browser bar */}
                <div className="bg-gray-200 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                    fastmenu.app/seunegocio
                  </div>
                </div>
                {/* Mockup content */}
                <div className="bg-white p-0">
                  {/* Header */}
                  <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600 flex items-end pb-3 px-4">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 mb-1" />
                      <div className="h-3 w-24 bg-white/80 rounded-full" />
                      <div className="h-2 w-16 bg-white/50 rounded-full mt-1" />
                    </div>
                  </div>
                  {/* Category tabs */}
                  <div className="flex gap-2 px-4 py-3 overflow-hidden">
                    {['Hambúrgueres', 'Pizzas', 'Bebidas'].map((c, i) => (
                      <div
                        key={c}
                        className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
                          i === 0
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                  {/* Product cards */}
                  <div className="px-4 pb-4 space-y-3">
                    {[
                      { name: 'Classic Burger', price: 'R$ 28,90', color: 'bg-amber-100' },
                      { name: 'Smash Burger', price: 'R$ 32,90', color: 'bg-orange-100' },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className={`w-14 h-14 rounded-lg ${p.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Pão brioche, blend 180g</div>
                          <div className="text-sm font-bold text-[var(--color-primary)] mt-1">{p.price}</div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 16 16" className="w-4 h-4 text-white fill-current">
                            <path d="M8 3.5a.5.5 0 01.5.5v3.5H12a.5.5 0 010 1H8.5V12a.5.5 0 01-1 0V8.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-60 -z-10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-50 rounded-full blur-2xl opacity-80 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
