import { Send, Plus } from 'lucide-react';

interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
    isConnected: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function MessageInput({
    value,
    onChange,
    onSend,
    onKeyPress,
    isConnected,
    inputRef
}: MessageInputProps) {
    return (
        <div className="bg-white border-t border-gray-200" style={{ padding: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
                <button
                    className="hover:bg-gray-100 rounded-lg text-gray-500"
                    style={{ padding: '0.5rem' }}
                >
                    <Plus className="w-5 h-5" />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                    placeholder="Nhập tin nhắn..."
                    disabled={!isConnected}
                    className="flex-1 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    style={{ padding: '0.75rem 1rem' }}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim() || !isConnected}
                    className="bg-primary-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition"
                    style={{ padding: '0.75rem' }}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
