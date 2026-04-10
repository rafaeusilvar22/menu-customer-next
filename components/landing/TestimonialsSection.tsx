const testimonials = [
  {
    quote:
      'Desde que comecei a usar o Fastmenu, meus pedidos de delivery aumentaram muito. O cardápio fica lindo e meus clientes adoram poder ver as fotos dos pratos.',
    name: 'Ana Paula',
    role: 'Dona de hamburgueria',
    initials: 'AP',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    quote:
      'Super fácil de configurar. Em menos de uma hora já estava com o cardápio no ar e compartilhando no WhatsApp. Não precisa de nenhum conhecimento técnico.',
    name: 'Carlos Eduardo',
    role: 'Pizzaria artesanal',
    initials: 'CE',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    quote:
      'O melhor é que funciona direto no celular sem precisar baixar nada. Meus clientes chegam a pedir pelo cardápio sem eu precisar explicar como usa.',
    name: 'Juliana M.',
    role: 'Açaí e sorvetes',
    initials: 'JM',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-secondary)] mb-3">
            O que dizem nossos clientes
          </h2>
          <p className="text-gray-500 text-lg">
            Mais de 500 estabelecimentos já vendem online com o Fastmenu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 shadow-sm card-hover animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} viewBox="0 0 16 16" className="w-4 h-4 fill-amber-400">
                    <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.4l-3.6 1.9.7-4L2.2 5.7l4-.6z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-secondary)]">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
