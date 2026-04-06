import { useState, useRef, useEffect } from "react";
import DashboardNav from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AGL Command Center AI assistant. I can help you query operational data, generate insights, and answer questions about your business. Try asking me things like:\n\n- Which mechanic has the highest completion rate this month?\n- Show me all pending payments\n- What's our revenue by channel this week?\n- How many vehicles did we service today?\n- Which staff member was late most often?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: queryAI } = trpc.ai.chat.useMutation({
    onSuccess: (response: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${error.message || "Failed to process your query"}`,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    queryAI({ query: input });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">AI Assistant</h1>

          {/* Messages Container */}
          <Card className="flex-1 p-6 mb-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown>{message.content}</Streamdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me about your operations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
