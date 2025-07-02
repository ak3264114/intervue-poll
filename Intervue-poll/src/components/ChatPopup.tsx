import React, { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  name: string;
  message: string;
  timestamp: string;
}

interface ChatPopupProps {
  messages: Message[];
  studentName: string;
  participants: string[];
}

const ChatPopup: React.FC<ChatPopupProps> = ({ messages, studentName, participants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');

  const socket = getSocket();

  const sendMessage = () => {
    if (!inputMessage.trim() || !studentName) return;
    socket.emit('chat-message', {
      name: studentName,
      message: inputMessage.trim(),
    });
    setInputMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-full p-3 shadow-lg bg-primary text-white"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {isOpen && (
          <div className="absolute bottom-14 right-0 w-80 max-h-[500px] flex flex-col bg-white shadow-xl border rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'chat' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'participants' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                onClick={() => setActiveTab('participants')}
              >
                Participants
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                  {messages.map((msg, idx) => {
                    const isSelf = msg.name === studentName;
                    return (
                      <div
                        key={idx}
                        className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                          isSelf
                            ? 'bg-purple-500 text-white self-end ml-auto'
                            : 'bg-gray-800 text-white self-start mr-auto'
                        }`}
                      >
                        {!isSelf && <div className="text-xs font-bold mb-1 text-purple-200">{msg.name}</div>}
                        <div>{msg.message}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex border-t">
                  <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 text-sm border-0 outline-none"
                  />
                  <Button onClick={sendMessage} className="rounded-none rounded-r-xl text-sm">
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                {participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-gray-100 rounded-md text-gray-800 text-sm font-medium"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPopup;
