import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

type Message = {
  id: number;
  text: string;
  sender: 'server' | 'user';
  timestamp: Date;
  // captcha: string, 
  // captcha_id: number, 
  // tab_id: number, 
  // status: string,
};

export default function Home() {
  const dispatch = useDispatch();
  const wsConnection = useSelector((state: any) => state.auth.wsConnection);
  const wsMessage    = useSelector((state: any) => state.auth.wsMessage);
  const [wsMessages, setWsMessages] = useState<any>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Welcome! Please select any of my messages to reply.',
      sender: 'server',
      timestamp: new Date(),
    },
    // {captcha: "Request Image", captcha_id: 3, tab_id: 2, status: "pending"},
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{console.log("======> ",wsMessage); setWsMessages(prev => [...prev, {...wsMessage,sender:"server"}]);}, [wsMessage])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectMessage = (message: Message) => {
    if (message.sender === 'server') {
      setSelectedMessage(message);
      // setMessages(prev => prev.map(msg => 
      //   msg.id === message.id ? {...msg, selected: true} : {...msg, selected: false}
      // ));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedMessage) return;
    
    // Add user message with reference to selected message
    setWsMessages(prev => [
      ...prev,
      {
        sender: 'user',
        captcha_id: selectedMessage?.captcha_id,
        tab_id: selectedMessage?.tab_id,
        captcha_text: inputValue.trim(),
      }
    ]);
    
    setInputValue('');
    setSelectedMessage(null);
    const a = {   
      captcha_id: selectedMessage?.captcha_id,
      tab_id: selectedMessage?.tab_id,
      captcha_text: inputValue.trim(),
    }
    wsConnection.send(JSON.stringify(a));
    console.log(">>>>>> ",selectedMessage,inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto w-full bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
        {/* Chat header */}
        <div className="bg-gray-700 text-gray-100 p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">WebSocket Chat</h2>
          <p className="text-xs text-gray-400">
            {selectedMessage 
              ? `Replying to: "${selectedMessage.captcha.substring(0, 20)}${selectedMessage.captcha.length > 20 ? '...' : ''}"`
              : 'Select a server message to reply'}
          </p>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {wsMessages.map((message) => (
              <div key={message.captcha_id} onClick={() => handleSelectMessage(message)} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-xs p-3 rounded-lg cursor-pointer transition-all ${message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : message.selected
                      ? 'bg-gray-500 text-white rounded-bl-none border-2 border-blue-400'
                      : 'bg-gray-600 text-gray-100 rounded-bl-none hover:bg-gray-550'}`}
                >
                  <div className="text-sm">{message.sender=== "user"? message.captcha_text : <img className='h-5' src={message.captcha} alt="" /> }</div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    12:00 AM
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
          {selectedMessage && (
            <div className="bg-gray-700 text-gray-300 text-sm p-2 mb-2 rounded-md flex justify-between">
              <p className='flex'>Replying to: <img className='h-5 ml-3' src={selectedMessage.captcha} alt="" /></p>
              <button type="button" onClick={() => {setSelectedMessage(null); setMessages(prev => prev.map(msg => ({...msg, selected: false})));}} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-gray-700 text-gray-100 border border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={selectedMessage ? "Type your reply..." : "Select a message to reply"}
              disabled={!selectedMessage}
            />
            <button 
              type="submit" 
              className={`rounded-full p-2 ${selectedMessage 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
              disabled={!selectedMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}