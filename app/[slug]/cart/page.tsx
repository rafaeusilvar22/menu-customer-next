'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useEstablishment } from '@/hooks/useEstablishment';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatPhone, DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/format';
import { slugApi } from '@/lib/api';
import { getCartToken, clearCartToken } from '@/lib/cart-token';
import { getActiveOrder, setActiveOrder } from '@/lib/active-order';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CheckoutPayload, DeliveryType, PaymentMethod } from '@/types/order';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CartPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { cart, loading, fetchCart, clearCart } = useCart();
  const { establishment } = useEstablishment(slug);

  const [form, setForm] = useState<CheckoutPayload>({
    delivery_type: 'pickup',
    payment_method: 'pix',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [blockedByOrder, setBlockedByOrder] = useState<string | null>(null);
  const { getLocation, status: geoStatus, error: geoError, geocodeAddress, geocodeStatus } = useGeolocation();

  useEffect(() => {
    fetchCart(slug);
    setBlockedByOrder(getActiveOrder(slug));
  }, [slug]);

  const workspace = establishment.data;
  const acceptedMethods = workspace?.accepted_payment_methods ?? [];
  const subtotal = cart?.items.reduce((a, i) => a + i.subtotal, 0) ?? 0;
  const deliveryFee = form.delivery_type === 'delivery' && workspace?.delivery_fee ? Number(workspace.delivery_fee) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setError('');
    setSubmitting(true);
    try {
      const token = getCartToken(slug);
      const result = await slugApi(slug).checkout(token, form);
      clearCartToken(slug);
      setActiveOrder(slug, result.order_uuid);
      if (form.customer_name?.trim()) {
        localStorage.setItem('customer_chat_name', form.customer_name.trim());
      }
      router.push(`/${slug}/order/${result.order_uuid}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erro ao finalizar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetLocation = async () => {
    const result = await getLocation();
    if (!result) return;
    setForm((f) => ({
      ...f,
      delivery_latitude: result.latitude,
      delivery_longitude: result.longitude,
      delivery_address: result.address || f.delivery_address,
    }));
  };

  useEffect(() => {
    if (form.delivery_type !== 'delivery') return;
    const address = form.delivery_address ?? '';
    if (address.length < 8) return;

    const timer = setTimeout(async () => {
      const coords = await geocodeAddress(address);
      if (coords) {
        setForm((f) => ({
          ...f,
          delivery_latitude: coords.latitude,
          delivery_longitude: coords.longitude,
        }));
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form.delivery_address, form.delivery_type]);

  const handleClear = async () => {
    if (!confirm('Limpar o carrinho?')) return;
    await clearCart(slug);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  if (blockedByOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
            <BackButton onClick={() => router.back()} />
            <h1 className="font-semibold text-gray-800">Meu Carrinho</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 p-10 text-center">
          <span className="text-5xl">⏳</span>
          <p className="font-semibold text-gray-800">Você já tem um pedido em andamento</p>
          <p className="text-sm text-gray-500">Aguarde a conclusão do pedido atual antes de fazer um novo.</p>
          <Button onClick={() => router.push(`/${slug}/order/${blockedByOrder}`)}>
            Acompanhar pedido
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/${slug}`)}>
            Ver cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <BackButton onClick={() => router.back()} />
          <h1 className="font-semibold text-gray-800">Meu Carrinho</h1>
        </div>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 p-10 text-center">
          <span className="text-6xl">🛒</span>
          <p className="text-gray-500">Seu carrinho está vazio.</p>
          <Button variant="ghost" onClick={() => router.push(`/${slug}`)}>Ver cardápio</Button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} slug={slug} />
          ))}

          <button onClick={handleClear} className="text-xs text-red-400 w-full text-right mt-1">
            Limpar carrinho
          </button>

          {/* Checkout form */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mt-4 space-y-5">
            <h2 className="font-bold text-gray-800 text-sm border-l-4 border-[var(--color-primary)] pl-3">
              Dados do pedido
            </h2>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Nome (opcional)</label>
              <input
                value={form.customer_name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                placeholder="Seu nome"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Telefone (opcional)</label>
              <input
                value={form.customer_phone ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer_phone: formatPhone(e.target.value) }))
                }
                placeholder="(00) 00000-0000"
                inputMode="tel"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Tipo de entrega</label>
              <div className="flex gap-2">
                {(['table', 'pickup', 'delivery'] as DeliveryType[]).filter(
                  (t) => t !== 'delivery' || workspace?.delivery_enabled
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((f) => ({ ...f, delivery_type: type }))}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border-2 transition-all ${
                      form.delivery_type === type
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                        : 'border-gray-200 text-gray-500 bg-white'
                    }`}
                  >
                    {type === 'table' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="3" rx="1" />
                        <path d="M3 6v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5h8v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6" />
                      </svg>
                    )}
                    {type === 'pickup' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    )}
                    {type === 'delivery' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="2" />
                        <path d="M16 8h4l3 5v4h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    )}
                    {DELIVERY_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {form.delivery_type === 'table' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Número da mesa</label>
                <input
                  value={form.table_number ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                  placeholder="Ex: 05"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            )}

            {form.delivery_type === 'delivery' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Endereço de entrega</label>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoStatus === 'loading'}
                  className="w-full mb-2 flex items-center justify-center gap-2 border border-dashed border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity"
                >
                  {geoStatus === 'loading' ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Obtendo localização...
                    </>
                  ) : geoStatus === 'success' ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Localização obtida
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                      </svg>
                      Usar minha localização
                    </>
                  )}
                </button>

                {geoError && (
                  <p className="text-xs text-red-500 mb-2">{geoError}</p>
                )}

                {form.delivery_latitude && form.delivery_longitude && (
                  <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                    </svg>
                    <span>{form.delivery_latitude.toFixed(5)}, {form.delivery_longitude.toFixed(5)}</span>
                    {geocodeStatus === 'loading' && <span className="text-[var(--color-primary)]">buscando...</span>}
                    {geocodeStatus === 'success' && geoStatus !== 'success' && <span className="text-green-500">✓</span>}
                  </p>
                )}

                <input
                  value={form.delivery_address ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
                  placeholder="Rua, número, bairro"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            )}

            {acceptedMethods.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Forma de pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {acceptedMethods.map((method: string) => (
                    <button
                      key={method}
                      onClick={() => setForm((f) => ({ ...f, payment_method: method as PaymentMethod }))}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-medium border-2 transition-all ${
                        form.payment_method === method
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                          : 'border-gray-200 text-gray-600 bg-white'
                      }`}
                    >
                      {method === 'credit_card' || method === 'debit_card' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      ) : method === 'cash' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                        </svg>
                      )}
                      {PAYMENT_METHOD_LABELS[method] ?? method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Observações (opcional)</label>
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: sem pimenta, alergia a amendoim..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <h2 className="font-bold text-gray-800 text-sm border-l-4 border-[var(--color-primary)] pl-3 mb-3">
              Resumo
            </h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {form.delivery_type === 'delivery' && workspace?.delivery_fee != null && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa de entrega</span>
                <span>{workspace.delivery_fee === 0 ? 'Grátis' : formatCurrency(workspace.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-[var(--color-primary)]">{formatCurrency(total)}</span>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-safe z-50">
          <Button onClick={handleCheckout} loading={submitting} className="w-full py-4 text-base rounded-2xl">
            Fazer pedido · {formatCurrency(total)}
          </Button>
        </div>
      )}
    </div>
  );
}
