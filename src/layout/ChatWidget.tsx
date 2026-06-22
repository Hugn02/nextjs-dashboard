"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Kính chào Quý khách! 🌸 Tôi là Trợ lý ảo Noritake Vietnam. Tôi có thể giúp Quý khách tìm kiếm các bộ ấm chén, bát đĩa sứ xương cao cấp Nhật Bản hoặc giải đáp các thắc mắc về chính sách. Quý khách cần hỗ trợ thông tin gì hôm nay ạ?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Reset input nếu gửi từ ô nhập liệu
    if (!textToSend) {
      setInputMessage("");
    }

    // Thêm tin nhắn của User
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Tạo một tin nhắn bot trống để chuẩn bị nhận stream
    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      sender: "bot",
      text: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:3002/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.body) throw new Error("No body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: fullText } : m))
        );
      }
    } catch (error) {
      console.error("Chat API connection error:", error);
      const botMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Hiện tại tôi đang gặp khó khăn khi kết nối với máy chủ. Xin Quý khách vui lòng thử lại sau giây lát! 🌸",
        timestamp: new Date(),
      };
      // Cập nhật tin nhắn placeholder cũ bằng nội dung lỗi thay vì thêm tin mới
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? botMsg : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickPrompts = [
    { label: "Ấm trà bán chạy ☕", value: "Cho tôi xem các bộ ấm trà bán chạy nhất" },
    { label: "Sứ xương là gì? 🦴", value: "Sứ xương là gì và tại sao nó lại đắt?" },
    { label: "Quà tặng dưới 2 triệu 🎁", value: "Tìm sản phẩm làm quà tặng dưới 2 triệu đồng" },
    { label: "Chính sách đổi trả 🔄", value: "Chính sách đổi trả hàng của Noritake như thế nào?" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Cormorant_Garamond',_serif]">
      {/* Nút Chat nổi (Floating Button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#8b6914] via-[#c4a84f] to-[#8b6914] text-white shadow-[0_8px_30px_rgb(196,168,79,0.4)] cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 hover:rotate-12"
          aria-label="Mở cửa sổ Chat"
        >
          {/* Vòng tròn hiệu ứng sóng phát ra xung quanh */}
          <span className="absolute inset-0 rounded-full bg-[#c4a84f]/30 animate-ping opacity-75"></span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-7 h-7 md:w-8 md:h-8 relative z-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
        </button>
      )}

      {/* Cửa sổ Chat (Chat Window) */}
      {isOpen && (
        <div className="flex flex-col w-[380px] max-w-[calc(100vw-2rem)] h-[480px] md:h-[580px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#b49664]/20 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 bg-[#2c1a00] text-white border-b border-[#c4a84f]/20">
            <div className="flex items-center gap-3">
              {/* Avatar thiết kế mạ vàng sang trọng */}
              <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#8b6914] to-[#c4a84f] p-[1px] shadow-md">
                <div className="flex items-center justify-center w-full h-full rounded-full bg-[#2c1a00]">
                  <span className="text-[12px] md:text-[15px] font-bold text-[#c4a84f] tracking-wider">N</span>
                </div>
                {/* Dấu chấm xanh Online */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#2c1a00] rounded-full"></span>
              </div>

              <div>
                <h3 className="text-xs md:text-sm font-semibold tracking-wider uppercase text-[#c4a84f]">
                  Noritake Assistant
                </h3>
                <p className="text-[11px] text-[#faf7f2]/70 font-sans tracking-wide">
                  Đang hoạt động • Trợ lý ảo cao cấp
                </p>
              </div>
            </div>

            {/* Nút thu nhỏ / Đóng */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#faf7f2]/60 hover:text-[#c4a84f] cursor-pointer transition-colors p-1"
              aria-label="Thu nhỏ cửa sổ Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf7f2] scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar của Bot ở phía trước */}
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-[#c4a84f] text-[#2c1a00] flex items-center justify-center text-xs font-bold mr-2 shrink-0 self-end shadow-sm">
                    N
                  </div>
                )}

                {/* Bong bóng tin nhắn */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all duration-200 ${msg.sender === "user"
                    ? "bg-[#c4a84f] text-white rounded-br-sm font-sans"
                    : "bg-white text-[#2c1a00] border border-[#b49664]/10 rounded-bl-sm font-sans"
                    }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Thời gian gửi tin nhắn */}
                  <span
                    className={`block text-[9px] mt-1 text-right ${msg.sender === "user" ? "text-white/70" : "text-gray-400"
                      }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Trạng thái AI đang gõ (Loading Indicator) */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-[#c4a84f] text-[#2c1a00] flex items-center justify-center text-xs font-bold mr-2 shrink-0 self-end shadow-sm">
                  N
                </div>
                <div className="bg-white border border-[#b49664]/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2.5 h-2.5 bg-[#c4a84f]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 bg-[#c4a84f]/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 bg-[#c4a84f] rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Vùng gợi ý câu hỏi nhanh (Quick Prompts) */}
          <div className="px-4 py-2 bg-[#faf7f2] border-t border-[#b49664]/10 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt.value)}
                className="shrink-0 px-3 py-1.5 bg-white hover:bg-[#f7f3eb] text-[#8b6914] hover:text-[#2c1a00] border border-[#c4a84f]/30 hover:border-[#8b6914] rounded-full text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#b49664]/10 flex gap-2 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Hỏi Noritake Assistant..."
              className="flex-1 px-4 py-2.5 bg-[#faf7f2] border border-[#b49664]/20 rounded-full text-sm font-sans focus:outline-none focus:border-[#c4a84f] focus:bg-white text-[#2c1a00] placeholder-gray-400 transition-all duration-200"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim()}
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b6914] to-[#c4a84f] text-white shadow-md cursor-pointer transition-all duration-200 ${!inputMessage.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                }`}
              aria-label="Gửi tin nhắn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CSS ẩn thanh cuộn ngang của quick prompts */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #faf7f2;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c4a84f/50;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
