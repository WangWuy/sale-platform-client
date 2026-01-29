interface TypingIndicatorProps {
    avatarUrl?: string;
    userName: string;
}

export default function TypingIndicator({ avatarUrl, userName }: TypingIndicatorProps) {
    return (
        <div className="flex items-end justify-start" style={{ gap: '0.5rem' }}>
            {/* Avatar */}
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                    {userName.substring(0, 1).toUpperCase()}
                </div>
            )}

            {/* Typing bubble */}
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm" style={{ padding: '0.75rem 1rem' }}>
                <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <div className="flex" style={{ gap: '0.25rem' }}>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
