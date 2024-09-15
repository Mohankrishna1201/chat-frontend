import React, { useEffect, useState } from "react";
import {
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
    TypingIndicator,
    LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css"; // Optional if using default Stream CSS

const ChatLayout = ({ activeChannel }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChannel) return;

            setLoading(true);
            try {
                const response = await activeChannel.query({
                    messages: { limit: 50 }, // Fetch the last 50 messages initially
                });

                setMessages(response.messages);
            } catch (error) {
                setError("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [activeChannel]);

    const loadMoreMessages = async () => {
        if (!activeChannel || !hasMore || loading) return;

        setLoading(true);
        try {
            const oldestMessageId = messages[0]?.id;
            const response = await activeChannel.query({
                messages: { limit: 30, id_lt: oldestMessageId }, // Load older messages
            });

            if (response.messages.length === 0) {
                setHasMore(false); // No more messages to load
            } else {
                setMessages((prevMessages) => [
                    ...response.messages,
                    ...prevMessages,
                ]);
            }
        } catch (error) {
            setError("Failed to load older messages");
        } finally {
            setLoading(false);
        }
    };

    if (!activeChannel) return <div>Loading channel...</div>;

    return (
        <div className="flex flex-col w-3/4 h-full border rounded-lg shadow-lg">
            <Channel channel={activeChannel}>
                {/* Channel Header */}
                <div className="bg-gray-100 p-3 border-b">
                    <ChannelHeader />
                </div>

                {/* Conversation Area */}
                <div className="flex flex-col flex-grow relative h-full bg-white">
                    {/* Message List with Infinite Scrolling */}
                    <div className="flex-grow overflow-y-auto p-4">
                        {loading && <LoadingIndicator />}
                        {error && <p className="text-red-500">{error}</p>}

                        <MessageList
                            messages={messages}
                            loadMore={loadMoreMessages} // Infinite scroll handler
                            hasMore={hasMore}
                        />
                    </div>

                    {/* Typing Indicator */}
                    <TypingIndicator />

                    {/* Message Input at the bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-gray-50">
                        <MessageInput focus />
                    </div>
                </div>
            </Channel>
        </div>
    );
};

export default ChatLayout;
