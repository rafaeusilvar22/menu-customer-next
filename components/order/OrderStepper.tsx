import { DeliveryType, OrderStatus } from '@/types/order';
import { ORDER_STATUS_LABELS } from '@/lib/format';

const ALL_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
const STEPS_WITHOUT_DELIVERY: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function getSteps(deliveryType: DeliveryType): OrderStatus[] {
  return deliveryType === 'delivery' ? ALL_STEPS : STEPS_WITHOUT_DELIVERY;
}

interface Props {
  status: OrderStatus;
  deliveryType: DeliveryType;
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const STEP_SUBTITLES: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação do estabelecimento',
  confirmed: 'Pedido aceito e será preparado em breve',
  preparing: 'Seu pedido está sendo preparado na cozinha',
  ready: 'Pronto! Pode retirar ou aguardar o entregador',
  delivering: 'O entregador está a caminho!',
  delivered: 'Aproveite! Bom apetite 🍽️',
  cancelled: '',
};

const READY_SUBTITLES: Record<DeliveryType, string> = {
  delivery: 'Pronto! Aguardando o entregador',
  pickup: 'Pronto! Pode retirar no balcão',
  table: 'Pronto! Será servido na sua mesa em instantes',
};

const STEP_ICONS: Record<OrderStatus, string> = {
  pending: '🕐',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '🛍️',
  delivering: '🛵',
  delivered: '🎉',
  cancelled: '❌',
};

export function OrderStepper({ status, deliveryType }: Props) {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-500">
          <XIcon />
        </div>
        <p className="text-red-600 font-bold text-base">Pedido cancelado</p>
        <p className="text-red-400 text-sm mt-1">Entre em contato com o estabelecimento para mais informações.</p>
      </div>
    );
  }

  const steps = getSteps(deliveryType);
  const currentIndex = steps.indexOf(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in-up">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">
        Status do pedido
      </p>

      <div>
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === steps.length - 1;

          return (
            <div key={step} className="flex gap-4">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center shrink-0
                    transition-all duration-500
                    ${done
                      ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30'
                      : active
                      ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/40 ring-4 ring-[var(--color-primary)]/15'
                      : 'bg-gray-100 text-gray-300'
                    }
                  `}
                >
                  {done ? (
                    <CheckIcon />
                  ) : active ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 my-1.5 min-h-[20px] rounded-full transition-all duration-700 ${
                      done ? 'bg-[var(--color-primary)]' : 'bg-gray-100'
                    }`}
                  />
                )}
              </div>

              {/* Content column */}
              <div className={`pb-5 ${isLast ? 'pb-0' : ''} pt-0.5 flex-1`}>
                <div className="flex items-center gap-2">
                  {active && (
                    <span className="text-base">{STEP_ICONS[step]}</span>
                  )}
                  <p
                    className={`text-sm font-semibold leading-tight transition-colors duration-300 ${
                      active ? 'text-gray-900 text-base'
                      : done ? 'text-gray-400'
                      : 'text-gray-300'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </p>
                </div>
                {active && (
                  <p className="text-xs text-[var(--color-primary)] mt-1 font-medium leading-snug">
                    {step === 'ready' ? READY_SUBTITLES[deliveryType] : STEP_SUBTITLES[step]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
