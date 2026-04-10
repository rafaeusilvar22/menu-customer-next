export function CtaBanner() {
  return (
    <section className="py-16 lg:py-20" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-emphasis) 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Pronto para digitalizar seu cardápio?
        </h2>
        <p className="text-orange-100 text-lg mb-8 max-w-md mx-auto">
          Mais de 500 estabelecimentos já vendem mais com o Fastmenu. Comece grátis hoje.
        </p>
        <a
          href="#"
          className="inline-block bg-white text-[var(--color-primary)] font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors shadow-lg shadow-orange-900/20 text-lg"
        >
          Começar agora, é grátis
        </a>
        <p className="text-orange-200 text-sm mt-4">Sem cartão de crédito. Cancele quando quiser.</p>
      </div>
    </section>
  );
}
