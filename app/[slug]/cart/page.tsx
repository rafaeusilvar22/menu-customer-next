'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useEstablishment } from '@/hooks/useEstablishment';
import { useCartRecommendations } from '@/hooks/useCartRecommendations';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { RecommendedProducts } from '@/components/menu/RecommendedProducts';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatPhone, DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/format';
import { slugApi } from '@/lib/api';
import { getCartToken, clearCartToken } from '@/lib/cart-token';
import { getActiveOrder, setActiveOrder } from '@/lib/active-order';
import { DeliveryAddressMap, LocationResult } from '@/components/cart/DeliveryAddressMap';
import { CheckoutPayload, CouponValidationResult, DeliveryType, PaymentMethod } from '@/types/order';
import { Product } from '@/types/product';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CartPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { cart, loading, fetchCart, clearCart } = useCart();
  const { establishment } = useEstablishment(slug);

  const [form, setForm] = useState<CheckoutPayload>({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'pickup',
    payment_method: 'pix',
  });

  // Structured delivery address fields
  const [deliveryPin, setDeliveryPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [deliveryComplement, setDeliveryComplement] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [blockedByOrder, setBlockedByOrder] = useState<string | null>(null);
  const [addingRec, setAddingRec] = useState<number | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; deliveryPin?: string; deliveryNumber?: string }>({});

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const recommendations = useCartRecommendations(slug, cart?.items ?? []);

  useEffect(() => {
    fetchCart(slug);
    setBlockedByOrder(getActiveOrder(slug));
  }, [slug]);

  const workspace = establishment.data;
  const acceptedMethods = workspace?.accepted_payment_methods ?? [];
  const subtotal = cart?.items.reduce((a, i) => a + i.subtotal, 0) ?? 0;
  const deliveryFee = form.delivery_type === 'delivery' && workspace?.delivery_fee ? Number(workspace.delivery_fee) : 0;
  const discount = coupon?.discount_amount ?? 0;
  const total = subtotal + deliveryFee - discount;


  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const result = await slugApi(slug).validateCoupon({
        code,
        order_total: subtotal,
        customer_phone: form.customer_phone,
      });
      setCoupon(result);
      setForm((f) => ({ ...f, coupon_code: code }));
    } catch (e: any) {
      setCouponError(e?.response?.data?.message ?? 'Cupom inválido.');
      setCoupon(null);
      setForm((f) => ({ ...f, coupon_code: undefined }));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
    setForm((f) => ({ ...f, coupon_code: undefined }));
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    const nameVal = form.customer_name?.trim() ?? '';
    const phoneDigits = (form.customer_phone ?? '').replace(/\D/g, '');
    const errors: { name?: string; phone?: string; deliveryPin?: string; deliveryNumber?: string } = {};
    if (!nameVal) errors.name = 'Informe seu nome.';
    if (phoneDigits.length < 10) errors.phone = 'Informe um telefone válido.';
    if (form.delivery_type === 'delivery') {
      if (!deliveryPin) errors.deliveryPin = 'Marque o local de entrega no mapa.';
      if (!deliveryNumber.trim()) errors.deliveryNumber = 'Informe o número.';
    }
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setError('');

    const deliveryAddress = [
      deliveryStreet,
      deliveryNumber.trim(),
      deliveryComplement.trim(),
      deliveryReference.trim() && `Ref: ${deliveryReference.trim()}`,
    ].filter(Boolean).join(', ');

    const payload: CheckoutPayload = {
      ...form,
      ...(form.delivery_type === 'delivery' && {
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryPin?.latitude,
        delivery_longitude: deliveryPin?.longitude,
      }),
    };

    setSubmitting(true);
    try {
      const token = getCartToken(slug);
      const result = await slugApi(slug).checkout(token, payload);
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
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
            <BackButton onClick={() => router.back()} />
            <h1 className="font-semibold text-gray-800">Meu Carrinho</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 p-10 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl">
            ⏳
          </div>
          <p className="font-bold text-gray-800 text-lg">Pedido em andamento</p>
          <p className="text-sm text-gray-500 max-w-xs">Aguarde a conclusão do pedido atual antes de fazer um novo.</p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Button onClick={() => router.push(`/${slug}/order/${blockedByOrder}`)}>
              Acompanhar pedido
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/${slug}`)}>
              Ver cardápio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <BackButton onClick={() => router.back()} />
          <h1 className="font-semibold text-gray-800">Meu Carrinho</h1>
        </div>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 p-10 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
            🛒
          </div>
          <p className="font-semibold text-gray-700">Seu carrinho está vazio</p>
          <p className="text-sm text-gray-400">Adicione itens do cardápio para começar.</p>
          <Button variant="ghost" onClick={() => router.push(`/${slug}`)}>Ver cardápio</Button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-4 space-y-3 animate-fade-in-up">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} slug={slug} />
          ))}

          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 w-full text-right mt-1 transition-colors duration-150 flex items-center justify-end gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Limpar carrinho
          </button>

          {/* Recommendations */}
          {(recommendations.data ?? []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-2">
              <RecommendedProducts
                products={recommendations.data!}
                title="Adicionar ao pedido?"
                onAdd={async (product: Product, quantity: number) => {
                  if (product.max_flavors > 0) {
                    router.push(`/${slug}/product/${product.uuid}`);
                    return;
                  }
                  setAddingRec(product.id);
                  try {
                    const token = getCartToken(slug);
                    await slugApi(slug).addCartItem(token, { product_id: product.id, quantity });
                    await fetchCart(slug);
                  } catch {
                    // silent
                  } finally {
                    setAddingRec(null);
                  }
                }}
              />
            </div>
          )}

          {/* Checkout form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4 space-y-5">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold">1</span>
              Dados do pedido
            </h2>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">Nome</label>
              <input
                value={form.customer_name ?? ''}
                onChange={(e) => { setForm((f) => ({ ...f, customer_name: e.target.value })); setFieldErrors((fe) => ({ ...fe, name: undefined })); }}
                placeholder="Seu nome"
                className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300 ${fieldErrors.name ? 'border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100' : 'border-gray-200 focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10'}`}
              />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">Telefone</label>
              <input
                value={form.customer_phone ?? ''}
                onChange={(e) => { setForm((f) => ({ ...f, customer_phone: formatPhone(e.target.value) })); setFieldErrors((fe) => ({ ...fe, phone: undefined })); }}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300 ${fieldErrors.phone ? 'border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100' : 'border-gray-200 focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10'}`}
              />
              {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wide">Tipo de entrega</label>
              <div className="flex gap-2">
                {(['table', 'pickup', 'delivery'] as DeliveryType[]).filter(
                  (t) => t !== 'delivery' || workspace?.delivery_enabled
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((f) => ({ ...f, delivery_type: type }))}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl text-xs font-semibold border transition-all duration-200 active:scale-[0.97] ${
                      form.delivery_type === type
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8 text-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/15'
                        : 'border-gray-200 text-gray-400 bg-white hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50'
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
                <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">Número da mesa</label>
                <input
                  value={form.table_number ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                  placeholder="Ex: 05"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10 transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300"
                />
              </div>
            )}

            {form.delivery_type === 'delivery' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 block uppercase tracking-wide">Local de entrega</label>

                {workspace?.latitude != null && workspace?.longitude != null ? (
                  <>
                    <DeliveryAddressMap
                      workspaceLat={workspace.latitude as number}
                      workspaceLon={workspace.longitude as number}
                      onLocationChange={(result: LocationResult) => {
                        setDeliveryPin({ latitude: result.latitude, longitude: result.longitude });
                        setDeliveryStreet(result.street);
                        setFieldErrors((fe) => ({ ...fe, deliveryPin: undefined }));
                      }}
                    />
                    {fieldErrors.deliveryPin && (
                      <p className="text-xs text-red-500">{fieldErrors.deliveryPin}</p>
                    )}

                    {deliveryStreet && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                        </svg>
                        {deliveryStreet}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    O estabelecimento ainda não configurou o endereço de entrega.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      value={deliveryNumber}
                      onChange={(e) => { setDeliveryNumber(e.target.value); setFieldErrors((fe) => ({ ...fe, deliveryNumber: undefined })); }}
                      placeholder="Número *"
                      inputMode="numeric"
                      className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300 ${fieldErrors.deliveryNumber ? 'border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100' : 'border-gray-200 focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10'}`}
                    />
                    {fieldErrors.deliveryNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.deliveryNumber}</p>}
                  </div>
                  <input
                    value={deliveryComplement}
                    onChange={(e) => setDeliveryComplement(e.target.value)}
                    placeholder="Complemento"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10 transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300"
                  />
                </div>

                <input
                  value={deliveryReference}
                  onChange={(e) => setDeliveryReference(e.target.value)}
                  placeholder="Ponto de referência (opcional)"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10 transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300"
                />
              </div>
            )}

            {acceptedMethods.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wide">Forma de pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {acceptedMethods.map((method: string) => (
                    <button
                      key={method}
                      onClick={() => setForm((f) => ({ ...f, payment_method: method as PaymentMethod }))}
                      className={`flex items-center gap-2.5 px-3 py-3.5 rounded-2xl text-xs font-semibold border transition-all duration-200 active:scale-[0.97] ${
                        form.payment_method === method
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8 text-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/15'
                          : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
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
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">Observações (opcional)</label>
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: sem pimenta, alergia a amendoim..."
                rows={2}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10 transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </span>
              Cupom de desconto
            </h2>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-green-700">{coupon.code}</p>
                  <p className="text-xs text-green-600">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}% de desconto`
                      : `${formatCurrency(coupon.value)} de desconto`}
                    {' · '}−{formatCurrency(coupon.discount_amount)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800 transition-colors ml-3"
                  aria-label="Remover cupom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Digite o código"
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm uppercase tracking-wider focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10 transition-all duration-150 bg-gray-50/50 placeholder:text-gray-300 placeholder:normal-case placeholder:tracking-normal"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-40 hover:bg-[var(--color-emphasis)] active:scale-[0.97] transition-all duration-150 shadow-sm"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-xs text-red-500 mt-2">{couponError}</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
            <h2 className="font-bold text-gray-800 text-sm mb-3">
              Resumo do pedido
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
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto ({coupon?.code})</span>
                <span>−{formatCurrency(discount)}</span>
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
          <div className="bg-white/80 backdrop-blur-md rounded-t-2xl pt-3 -mx-4 px-4 border-t border-gray-100 shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)]">
            <Button
              onClick={handleCheckout}
              loading={submitting}
              disabled={submitting}
              className="w-full py-4 text-base rounded-2xl font-bold"
            >
              Finalizar pedido · {formatCurrency(total)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
