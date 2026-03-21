import { OrderMessage } from '@/types/order';

interface Props {
  message: OrderMessage;
}

export function MessageBubble({ message }: Props) {
  const isCustomer = message.sender_type === 'customer';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isCustomer
            ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {!isCustomer && (
          <p className="text-xs font-semibold text-[var(--color-primary)] mb-0.5">
            {message.sender_name || 'Estabelecimento'}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isCustomer ? 'text-white/70' : 'text-gray-400'} text-right`}>
          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
