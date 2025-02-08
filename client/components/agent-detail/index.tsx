"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Header } from "../ui/header";
import { AgentApiModal } from "../AgentApiModal ";


interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function AgentDetail() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("aiAgentChat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessages: Message[] = [
        ...messages,
        { sender: "user", text: inputMessage },
      ];
      setMessages(newMessages);
      setInputMessage("");

      setLoading(true);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: "" },
      ]);

      setTimeout(() => {
        setLoading(false);
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { sender: "ai", text: "This is a sample AI response." },
        ]);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Header />

        {/* Mobile Tabs */}
        
        <div className="block md:hidden mb-4 pb-6 pt-12">
          <div className="flex justify-around border-b border-border">
            <button
              className={`py-2 w-1/2 ${activeTab === "aiAgentChat" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
                }`}
              onClick={() => handleTabChange("aiAgentChat")}
            >
              AI Agent Chat
            </button>
            <button
              className={`py-2 w-1/2 ${activeTab === "information" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"
                }`}
              onClick={() => handleTabChange("information")}
            >
              Information
            </button>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-8 items-center justify-center pb-6 pt-12">
          {/* Information Section */}
          {(activeTab === "information" || window.innerWidth >= 768) && (
            <div className="md:col-span-3 space-y-6 p-2 rounded-md">
              {/* Agent Detail */}
              <div className="flex items-start flex-col gap-4 bg-[#151515] p-5 rounded-lg">
                <Image
                  src="/images/agent_1.svg"
                  alt="Agent Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-md text-primary">Nina Einstein</h2>
                  <p className="text-sm text-muted-foreground">Codename: CODE-MASTER</p>
                </div>
                <p>Technology innovation and<br />product development</p>
              </div>

              <div className="space-y-2 ">
                <div className="flex flex-row gap-1 px-5">
                  <Image
                    src="/images/agentprofile.svg"
                    alt="Agent Avatar"
                    width={13}
                    height={13}
                    className="rounded-full"
                  />
                  <h3 className="text-sm font-semibold text-primary">Personality Traits</h3>
                </div>

                <div className="grid grid-cols-2 gap-px bg-[#151515] border border-border rounded-lg overflow-hidden">
                  <div className="p-4 bg-black text-center border-b border-r border-border">
                    <h3 className="text-md font-semibold text-white">98%</h3>
                    <p className="text-sm text-muted-foreground">Intelligence</p>
                  </div>
                  <div className="p-4 bg-black text-center border-b border-border">
                    <h3 className="text-md font-semibold text-white">95%</h3>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-4 bg-black text-center border-r border-border">
                    <h3 className="text-md font-semibold text-white">97%</h3>
                    <p className="text-sm text-muted-foreground">Security</p>
                  </div>
                  <div className="p-4 bg-black text-center">
                    <h3 className="text-md font-semibold text-white">96%</h3>
                    <p className="text-sm text-muted-foreground">Processing</p>
                  </div>
                </div>

              </div>

              {/* Personality Traits */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary px-5">
                  Personality Traits
                </h3>
                <div className="border-border border rounded-lg py-4">
                  <ul className="text-xs text-muted-foreground list-disc ml-8">
                    <li>Advanced neural processing</li>
                    <li>Real-time data analysis</li>
                    <li>Adaptive learning systems</li>
                    <li>Multi-dimensional problem solving</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {(activeTab === "aiAgentChat" || window.innerWidth >= 768) && (
            <div className="md:col-span-8 min-h-[570px]">
              <div className="min-h-[570px] rounded-lg border-dashed border-2 flex flex-col relative">
                {/* Chat Header */}
                <div className="flex justify-between mb-6 border-b-2 border-dashed bg-[#151515] p-3">
                  <div className="flex place-items-start gap-2">
                    <div className="px-2 py-1 rounded-full bg-primary">
                      <Image
                        src="/images/Union.svg"
                        alt="union"
                        width={10}
                        height={18}
                        className="text-primary-foreground"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg text-foreground">Neural Interface</h3>
                      <p className="text-sm text-muted-foreground">
                        Cost per interaction: 10 GIN
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center place-items-start text-muted-foreground text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Active
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      {message.sender === "user" ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-lg p-2 px-3 max-w-xs bg-[#151515] text-foreground"
                          >
                            {message.text}
                          </div>
                          <div className="px-2 py-2 rounded-full bg-[#242424]">
                            <Image
                              src="/images/user.svg"
                              alt="User Icon"
                              width={10}
                              height={18}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 rounded-full bg-primary">
                            <Image
                              src="/images/Union.svg"
                              alt="AI Logo"
                              width={7}
                              height={16}
                              className="text-primary-foreground"
                            />
                          </div>
                          <div
                            className="rounded-lg py-2 max-w-xs text-white"
                          >
                            {message.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="absolute bottom-0 left-0 w-full flex items-center gap-2 p-3 border-t-2 border-dashed">
                  <input
                    type="text"
                    placeholder="Message Nina..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-grow py-2 px-4 bg-[#151515] text-white rounded-md outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3 py-2 bg-[#242424] rounded-md text-primary-foreground"
                  >
                    <Image
                      src="/images/Symbol.svg"
                      alt="union"
                      width={19}
                      height={20}
                      className="text-primary-foreground"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="bg-primary py-2 px-3 rounded-md text-primary-foreground m-3"  onClick={toggleModal}>
          agentapi
        </button>
        <AgentApiModal isOpen={isModalOpen} onClose={toggleModal} />
      </div>
    </div>
  );
}
