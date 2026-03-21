import { OrderStatus } from '@/types/order';
import { ORDER_STATUS_LABELS } from '@/lib/format';

const STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];

interface Props {
  status: OrderStatus;
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
  pending: 'Aguardando confirmação',
  confirmed: 'Pedido aceito',
  preparing: 'Na cozinha agora',
  ready: 'Pronto para retirada',
  delivering: 'A caminho!',
  delivered: 'Aproveite sua refeição!',
  cancelled: '',
};

export function OrderStepper({ status }: Props) {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-500">
          <XIcon />
        </div>
        <p className="text-red-600 font-semibold">Pedido cancelado</p>
        <p className="text-red-400 text-sm mt-1">Entre em contato com o estabelecimento.</p>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">
        Status do pedido
      </p>

      <div>
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step} className="flex gap-3.5">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    done
                      ? 'bg-[var(--color-primary)] text-white'
                      : active
                      ? 'bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]'
                      : 'bg-gray-100'
                  }`}
                >
                  {done ? (
                    <CheckIcon />
                  ) : active ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={`w-px flex-1 my-1 min-h-[18px] rounded-full transition-all duration-500 ${
                      done ? 'bg-[var(--color-primary)]' : 'bg-gray-100'
                    }`}
                  />
                )}
              </div>

              {/* Content column */}
              <div className={`pb-4 ${isLast ? 'pb-0' : ''} pt-0.5`}>
                <p
                  className={`text-sm font-semibold leading-tight transition-colors duration-300 ${
                    active
                      ? 'text-gray-900'
                      : done
                      ? 'text-gray-400'
                      : 'text-gray-300'
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </p>
                {active && (
                  <p className="text-xs text-[var(--color-primary)] mt-0.5 font-medium">
                    {STEP_SUBTITLES[step]}
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
