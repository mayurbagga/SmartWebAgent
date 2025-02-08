"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Header } from "../ui/header";
import axios from "axios";
import config from "@/config/config";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { X, Copy, ThumbsUp, ThumbsDown, RefreshCw, Check, Volume2, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ethers } from 'ethers';
import abi_erc20 from '@/config/abi_erc20.json';
import Modal from "../Modal";

// Add a CSS class for gray text
const grayTextClass = "text-gray-500";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  userAddress: string;
  // status: "Active" | "Inactive";
  imageUrl: string;
  llmModel: string;
}

// Add this CSS for the loader outside the component
const loaderStyle = `
  .loader {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function AgentDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<string>("aiAgentChat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("Generating response");
  const [balance, setBalance] = useState<string>("0");


  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const [isShowWalletModal, setIsShowWalletModal] = useState<boolean>(false); // State for showing wallet modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  // const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  // const [isGinTokenModalOpen, setIsGinTokenModalOpen] = useState(false);

  const handleCopy = (text: string, index: number): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000); // Reset icon after 2 seconds
    });
  };

  const { authenticated, login, user } = usePrivy();

  const userAddress = user?.wallet?.address;

 // Balance formatting function
 const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toFixed(2);
};

// Memoized formatted balance
const formattedBalance = useMemo(() => formatBalance(balance), [balance]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !userAddress) return;

      try {
        // Create a provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(config.ERC20_CONTRACT_ADDRESS, abi_erc20, provider);

        // Call the balanceOf function
        const balance = await contract.balanceOf(userAddress);
        setBalance(ethers.utils.formatUnits(balance, 18)); // Format the balance
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [authenticated, userAddress]);


  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!id) return; // Only fetch if id is available

      try {
        // Fetch agent details
        const agentResponse = await axios.get(`${config.BASE_URL}/api/assistants/${id}`);
        if (agentResponse.data.success) {
          console.log("Agent detail:", agentResponse.data.data);
          setAgentDetails(agentResponse.data.data);
        } else {
          console.log("Error fetching agent details:", agentResponse.data.message);
        }
      } catch (error) {
        console.log("Failed to fetch details:", error);
      }
    };

    fetchAgentDetails();
  }, [id]); // Dependency ensures fetch is triggered when id changes

  useEffect(() => {
    if (authenticated) {
      setIsShowWalletModal(false);
    }
  }, [authenticated]);


  useEffect(() => {
    // Scroll to the bottom of the chatbox every time messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingText((prev) => {
          if (prev === "Generating response...") return "Generating response";
          return prev + ".";
        });
      }, 500);
    } else {
      setLoadingText("Generating response");
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Ensure the loader is visible and properly styled
  const loader = (
    // <span className="loader ml-1 inline-block"></span
    <div className="w-4 h-4 border-t-2 border-b-2 border-primary ml-2 border-solid rounded-full animate-spin"></div>
  );



  if (!agentDetails) {
    return (
      <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-black z-50 mt-24">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
    );
  }



  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSendMessage = async (messageText: string) => {
    if (messageText.trim() === "") return;

    // Append the user's message to the message list
    const newMessages: Message[] = [
      ...messages,
      { sender: "user", text: messageText, timestamp: new Date().toLocaleTimeString() },
    ];
    setMessages(newMessages);
    setInputMessage("");

    const ginBalance = parseFloat(formatBalance(balance));
    if (ginBalance < 5) {
      // Show insufficient balance message
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "ai", text: "Insufficient GIN balance. You need at least 5 GIN tokens to chat.", timestamp: new Date().toLocaleTimeString() },
      ]);
      return; // Exit the function if balance is insufficient
    }

    setLoading(true);

    // Add a loading message to indicate waiting for AI response
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "ai", text: `${loadingText}`, timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      // Fetch threadId first, no need to check if it's already available
      const threadResponse = await axios.get(
        `${config.BASE_URL}/api/assistants/${id}/threadId`
      );

      console.log("Thread ID response from agent detail:", threadResponse.data.data.threadId);

      // Get the threadId from the response and use it to send the message
      const fetchedThreadId = threadResponse.data.data.threadId;
      if (!fetchedThreadId) {
        console.log("No thread ID returned from the API.");
        return;
      }

      // Call the message API with the fetched threadId
      const response = await axios.post(
        `${config.BASE_URL}/api/threads/${fetchedThreadId}/messages`,
        { message: messageText },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Message response:", response.data);

      // Extract the AI's response from the API response
      const aiResponseText =
        response.data.data.content[0]?.text?.value || "No reply from AI.";

      // Replace the "generating response..." message with the AI's actual response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the last loading message
        { sender: "ai", text: aiResponseText, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      console.log("Failed to send message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the last loading message
        { sender: "ai", text: "Failed to fetch a response from AI.", timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && authenticated) {
      handleSendMessage(inputMessage);
    }
  };


  const toggleWalletModal = () => {
    setIsShowWalletModal(!isShowWalletModal);
  };

  const toggleGinTokenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputClick = () => {
    // If not authenticated, open the wallet modal

    const formattedBalance = parseFloat(formatBalance(balance));
    
    if (!authenticated) {
      toggleWalletModal();
    }
    
    // If authenticated but balance is 0, open the GIN token modal
    // else if (parseFloat(balance) <= 0) {
    //   toggleGinTokenModal();
    // }
  };

  const handleRegenerateResponse = async (index: number) => {
    // Ensure we only regenerate if the previous message is from AI
    if (messages[index].sender !== "ai") return; 

    const userMessage = messages[index - 1]; // Assuming the user message is right before the AI response

    if (!userMessage) return; // No user message to regenerate from

    // Remove the previous AI response and show loading message
    setMessages((prevMessages) => [
      ...prevMessages.slice(0, index), // Keep messages before the AI response
      { sender: "ai", text: "Regenerating response...", timestamp: new Date().toLocaleTimeString() }, // New loading message
      ...prevMessages.slice(index + 1), // Keep messages after the AI response
    ]);

    try {
      // Fetch threadId first, no need to check if it's already available
      const threadResponse = await axios.get(
        `${config.BASE_URL}/api/assistants/${id}/threadId`
      );

      const fetchedThreadId = threadResponse.data.data.threadId;
      if (!fetchedThreadId) {
        console.log("No thread ID returned from the API.");
        return;
      }

      // Call the message API with the fetched threadId
      const response = await axios.post(
        `${config.BASE_URL}/api/threads/${fetchedThreadId}/messages`,
        { message: userMessage.text }, // Use the original user message
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Extract the AI's response from the API response
      const aiResponseText =
        response.data.data.content[0]?.text?.value || "No reply from AI.";

      // Replace the loading message with the new AI response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, index), // Remove the loading message
        { sender: "ai", text: aiResponseText, timestamp: new Date().toLocaleTimeString() }, // New AI response
        ...prevMessages.slice(index + 1), // Keep messages after the AI response
      ]);
    } catch (error) {
      console.log("Failed to regenerate message:", error);
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, index), // Remove the loading message
        { sender: "ai", text: "Failed to fetch a response from AI.", timestamp: new Date().toLocaleTimeString() },
        ...prevMessages.slice(index + 1), // Keep messages after the AI response
      ]);
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
            <div className="md:col-span-3 space-y-6 p-2 rounded-md ">
              {/* Agent Detail */}
              <div className="relative bg-[#151515] p-5 mt-6 rounded-lg">
                <div
                  className="absolute h-12 w-12 rounded-md bg-[#282828] border border-border flex items-center justify-center overflow-hidden"
                  style={{
                    top: "-25px", // Positioning the image half outside the card
                    left: "20px", // Align the image to the left side and centered on the border
                    transform: "translateY(0)",
                    zIndex: 10,
                  }}
                >
                  <Image
                    src={agentDetails.imageUrl || "/images/agent_6.svg"} // Fallback to default image if imageUrl is not provided
                    alt={agentDetails.name}
                    fill
                    className="object-cover p-2  rounded-full"
                  />
                </div>
                <div className="flex flex-col gap-4 mt-4">
                  <div>
                    <h2 className="text-md text-primary">
                      {agentDetails.name
                        .toLowerCase()
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </h2>
                    <p className="text-sm text-muted-foreground">Codename: {agentDetails.codeName}</p>
                    <p className="text-sm text-muted-foreground">LLM Model: {agentDetails.llmModel}</p>
                  </div>
                  <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {agentDetails.instructions}
                  </div>
                </div>
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
                  <h3 className="text-sm font-semibold text-primary py-1">Personality Traits</h3>
                </div>

                <div className="grid grid-cols-2 gap-px bg-[#151515] border border-border rounded-lg overflow-hidden">
                  <div className="p-4 bg-black text-center border-b border-r border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Intelligence</p>
                  </div>
                  <div className="p-4 bg-black text-center border-b border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-4 bg-black text-center border-r border-border">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Security</p>
                  </div>
                  <div className="p-4 bg-black text-center">
                    <h3 className="text-md font-semibold text-white">0%</h3>
                    <p className="text-sm text-muted-foreground">Processing</p>
                  </div>
                </div>

              </div>

              {/* Personality Traits */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary px-5 py-1">
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
            <div className="md:col-span-8 min-h-[540px]">
              <div className="min-h-[540px] rounded-lg border-dashed border-2 flex flex-col relative">
                {/* chat header */}
                <div className="flex justify-between mb-1 border-b-2 border-dashed bg-[#151515] p-3">
                  <div className="flex place-items-start gap-2">
                    {/* <div className="px-2 py-1 rounded-full bg-primary">
                      <Image
                        src="/images/Union.svg"
                        alt="union"
                        width={10}
                        height={18}
                        className="text-primary-foreground"
                      />
                    </div> */}
                    <Image
                      src={agentDetails.imageUrl || "/images/agent_6.svg"}
                      alt="union"
                      width={24}
                      height={24}
                      className="text-primary-foreground mt-1"
                    />

                    <div className="flex flex-col">
                      <h3 className="text-lg text-foreground ">{agentDetails.name
                        .toLowerCase()
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {agentDetails.userAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center place-items-start text-muted-foreground text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Active
                  </div>
                </div>
                <div
                  className="flex-grow pb-4 overflow-y-auto"
                  ref={chatBoxRef}
                  style={{ maxHeight: "400px" }}
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "user" ? (
                        <div className="flex items-start gap-2 mr-2">
                          <div className="rounded-lg p-2 px-3 max-w-xs bg-[#151515] text-foreground">
                            {message.text}
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {message.timestamp}
                            </div>
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
                        <div className="flex items-start gap-1 ml-2">
                          <div className="px-1 pb-4 rounded-full">
                            <Image
                              src={agentDetails.imageUrl || "/images/agent_6.svg"}
                              alt="AI Logo"
                              width={22}
                              height={22}
                              className="text-primary-foreground"
                            />
                          </div>
                          <div className="rounded-lg pb-4 max-w-xs text-white">
                            {message.sender === "ai" && (
                              <>
                                <div className="flex items-center">
                                  
                                {message.text ===
                                    "Insufficient GIN balance. You need at least 5 GIN tokens to chat." ? (
                                    <div>
                                      <span
                                        className="text-muted-foreground underline underline-dashed cursor-pointer"
                                        onClick={toggleGinTokenModal}
                                      >
                                        Insufficient GIN balance
                                      </span>
                                      . You need at least 5 GIN tokens to chat.
                                    </div>
                                  ) : (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeRaw]}
                                      className={`prose prose-invert ${loading && index === messages.length - 1 ? grayTextClass : ""
                                        }`}
                                    >
                                      {message.text}
                                    </ReactMarkdown>
                                  )}

                                  {loading && index === messages.length - 1 && loader}
                                </div>

                                {/* Only hide the icons and timestamp for the currently loading message */}
                                {!loading || index !== messages.length - 1 ? (
                                  <div className="flex gap-2 mt-2">
                                    {copiedMessageIndex === index ? (
                                      <Check className="text-white h-4 w-4" />
                                    ) : (
                                      <Copy
                                        className="text-white h-4 w-4 cursor-pointer"
                                        onClick={() => handleCopy(message.text, index)}
                                      />
                                    )}
                                    {/* Only show regenerate icon if message is not about insufficient balance */}
                                    {message.text !== "Insufficient GIN balance. You need at least 5 GIN tokens to chat." && (
                                      <RotateCcw 
                                        className="text-white h-4 w-4 cursor-pointer" 
                                        onClick={() => handleRegenerateResponse(index)}
                                      />
                                    )}

                                    {/* Display timestamp only if message is not loading */}
                                    <p className="text-xs text-gray-500">
                                      {message.timestamp}
                                    </p>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 w-full flex items-center gap-2 p-2 border-t-2 border-dashed">
                  <input
                    type="text"
                    placeholder={
                      !authenticated
                        ? "Connect your wallet first..."
                        : `Message ${agentDetails.name}...`
                    }
                    value={authenticated ? inputMessage : ""}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onClick={handleInputClick}
                    onKeyPress={
                      authenticated && !loading ? handleKeyPress : undefined
                    }
                    className={`flex-grow py-2 px-4 bg-[#151515] text-white rounded-md outline-none ${!authenticated ? "opacity-60 " : ""
                      }`}

                    // disabled={!authenticated || balance <= 0} // Disable input if not authenticated or balance is insufficient
                  />
                  <button
                    onClick={() => handleSendMessage(inputMessage)}
                    className={`px-3 py-2 bg-[#242424] rounded-md ${!authenticated || loading
                      ? "opacity-60 cursor-not-allowed"
                      : "text-primary-foreground"
                      }`}
                    disabled={!authenticated || loading} // Disable the button if not authenticated or loading
                  >
                    <Image
                      src="/images/Symbol.svg"
                      alt="union"
                      width={19}
                      height={20}
                    />
                  </button>

                  {/* Modal Component */}
                  {isModalOpen && <Modal isOpen={isModalOpen} onClose={toggleGinTokenModal} />}
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
      
      {isShowWalletModal && (
        <div className="fixed inset-0 z-50 flex flex-col gap-2 items-center justify-center bg-black/50">
          <div className="bg-[#242424] text-foreground rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Sign in to continue</h2>
              <button onClick={() => setIsShowWalletModal(false)} className="text-foreground">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Please sign in to send messages and save your conversation.
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
              onClick={login}
            >
              <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


