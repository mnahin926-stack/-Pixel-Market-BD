import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Plus, Check } from 'lucide-react';
import { useStore, SupportChat, SupportMessage } from '../../store';
import { toast } from 'react-toastify';

export default function AdminSupport() {
  const { supportChats, sendSupportMessage, markChatAsRead, addSupportChat } = useStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatId, supportChats]);

  const activeChat = supportChats.find(c => c.id === selectedChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !typedMessage.trim()) return;

    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: typedMessage.trim(),
      timestamp: new Date().toISOString()
    };

    sendSupportMessage(selectedChatId, newMessage);
    setTypedMessage('');
  };

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    markChatAsRead(id);
  };

  const triggerMockInquiry = () => {
    const randomUser = `গ্রাহক ${Math.floor(100 + Math.random() * 900)}`;
    const randomInquiry = [
      'स्मार्ट ওয়াচটির ডেলিভারি চার্জ কত ভাই?',
      'অর্ডার করার পর কতদিনের ভেতর পাবো?',
      'পেমেন্ট করার পর ট্রানজেকশন আইডি কোথায় দেবো?',
      'আপনাদের শোরুম বা কোনো ফিজিক্যাল দোকান আছে কি?',
      'ঢাকা সিটির ভেতর কি ক্যাশ অন ডেলিভারি পাওয়া যাবে?'
    ][Math.floor(Math.random() * 5)];

    const newId = `chat-${Date.now()}`;
    addSupportChat({
      id: newId,
      customerName: randomUser,
      lastMessage: randomInquiry,
      timestamp: '১০ মিনিট আগে',
      unread: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text: randomInquiry,
          timestamp: new Date().toISOString()
        }
      ]
    });

    toast.info(`নতুন গ্রাহক '${randomUser}' একটি ইনকোয়ারি পাঠিয়েছেন!`);
    if (!selectedChatId) {
      setSelectedChatId(newId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in text-slate-800 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">Support live কাস্টমার ডেস্ক</h2>
          <p className="text-slate-500 text-sm mt-1">গ্রাহকদের উত্থাপন করা অভিযোগ এবং প্রোডাক্ট জিজ্ঞাসাগুলোর রিপ্লাই দিন</p>
        </div>
        <button
          onClick={triggerMockInquiry}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" /> মক সাপোর্ট ইনকোয়ারি সিমুলেট করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-150 rounded-[32px] overflow-hidden min-h-[500px] h-[650px] shadow-sm">
        
        {/* Left Side: Users list */}
        <div className="md:col-span-4 border-r border-slate-150 flex flex-col h-full bg-slate-50/40">
          <div className="p-4 border-b border-slate-150 bg-white/70">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-widest font-sans">কনভারসেশন লিস্ট</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
            {supportChats.length > 0 ? (
              supportChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors cursor-pointer ${
                    selectedChatId === chat.id ? 'bg-indigo-50/60' : 'bg-transparent hover:bg-slate-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center font-bold flex-shrink-0 font-sans">
                    {chat.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <b className="text-slate-900 text-sm truncate">{chat.customerName}</b>
                      {chat.unread && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-450 mt-1 truncate font-medium">{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 font-bangla">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                কোনো লাইভ চ্যাট কনভারসেশন নেই।
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat panel view */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-100/35 relative">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-slate-150 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm font-sans">
                    {activeChat.customerName.charAt(0)}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-sm leading-tight">{activeChat.customerName}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">● অনলাইন কাস্টমার</p>
                  </div>
                </div>
              </div>

              {/* Messages feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChat.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-3xl text-sm ${
                        isAdmin 
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow shadow-indigo-600/10 font-semibold' 
                          : 'bg-white text-slate-805 border border-slate-150 rounded-tl-none font-semibold'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <div className={`text-[8px] mt-1 text-right font-black ${isAdmin ? 'text-indigo-200 font-mono' : 'text-slate-400 font-mono'}`}>
                          {new Date(m.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-150 flex gap-2 items-center flex-shrink-0">
                <input 
                  type="text" 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="আপনার বার্তা বা সহায়তাকারী সমাধান লিখুন..."
                  className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm mb-1 font-sans">কাস্টমার চ্যাট সিলেক্ট করুন</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">উত্তরের জন্য বাম পাশের তালিকা থেকে কাস্টমার নির্বাচন করুন অথবা সিমুলেটরে ক্লিক করুন।</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
