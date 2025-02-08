"use client";
import { useState, useContext, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DraggableFunction } from "./draggable-function";
import { DropZone } from "./drop-zone";
import { Label } from "../ui/label";
import Image from "next/image";
import { Header } from "../ui/header";
import axios from "axios";
import config from "@/config/config";
import { FunctionContext } from "../../contexts/FunctionContext";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AgentApiModal } from "../AgentApiModal ";
import { ethers } from "ethers";
import abi_erc20 from "@/config/abi_erc20.json";
import Modal from "../Modal";
import { useAuth } from "@/contexts/AuthContext";

export interface AgentFunction {
  id: string;
  name: string;
  description: string;
  type: "text" | "vision" | "decision";
}

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  imageUrl: string;
}

const availableFunctions: AgentFunction[] = [
  {
    id: "text-analysis",
    name: "Text Analysis",
    description: "Natural language processing capabilities",
    type: "text",
  },
  {
    id: "vision-system",
    name: "Vision System",
    description: "Image and video processing",
    type: "vision",
  },
  {
    id: "decision-engine",
    name: "Decision Engine",
    description: "Logic and decision-making capabilities",
    type: "decision",
  },
];

const llmProviders = {
  openai: ["gpt-4", "gpt-3.5-turbo", "gpt-4-1106-preview"],
  // google: ["gemini-pro", "gemini-flash"],
};

export default function AgentBuilder({ agentId }: any) {
  // console.log(agentId);

  const [formData, setFormData] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    llmProvider: "",
    llmModel: "",
  });

  const [selectedFunctions, setSelectedFunctions] = useState<AgentFunction[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [isGinModalOpen, setIsGinModalOpen] = useState<boolean>(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  // const [loadingMessage, setLoadingMessage] = useState<string>("");

  const { authenticated, login, user } = usePrivy();
  const router = useRouter();
  const { jwtToken } = useAuth();

  console.log("jwt token in agent builder.....", jwtToken);

  const walletAddress = user?.wallet?.address;

  const functionContext = useContext(FunctionContext);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toFixed(2);
  };
  console.log("🚀 ~ formatBalance ~ formatBalance:", formatBalance);

  // Memoized formatted balance

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !walletAddress) return;

      try {
        // Create a provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          config.ERC20_CONTRACT_ADDRESS,
          abi_erc20,
          provider
        );

        // Call the balanceOf function
        const balance = await contract.balanceOf(walletAddress);
        setBalance(ethers.utils.formatUnits(balance, 18)); // Format the balance
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [authenticated, walletAddress]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return; // Only fetch if id is available

      try {
        const agentResponse = await axios.get(
          `${config.BASE_URL}/api/assistants/${agentId}`
        );
        if (agentResponse.data.success) {
          const agentData = agentResponse.data.data;

          // Set form fields
          setFormData({
            agentName: agentData.name || "",
            codename: agentData.codeName || "",
            roleDescription: agentData.instructions || "",
            llmProvider: agentData.llmProvider || "",
            llmModel: agentData.llmModel || "",
          });

          setUserAddress(agentData.userAddress);

          // Set avatar URL directly
          if (agentData.imageUrl) {
            setPreviewUrl(agentData.imageUrl); // Set the avatar URL for preview
          } else {
            setPreviewUrl(null); // Reset if no avatar
          }

          // Prefill functions
          if (agentData.availableFunctions?.length) {
            const prefilledFunctions = agentData.availableFunctions.map(
              (func: any) => ({
                id: func.functionTitle,
                name: func.functionTitle,
                functionName: func.functionName,
                functionParameters: func.functionParameters,
                description: func.functionParameters?.description || "",
                type: func.functionParameters?.type || "text",
              })
            );
            console.log(
              "edit values for drag and drop..........",
              prefilledFunctions
            );
            setSelectedFunctions(prefilledFunctions);
          }

          console.log("Agent detail for update:", agentData);
        } else {
          console.error(
            "Error fetching agent details:",
            agentResponse.data.message
          );
        }
      } catch (error) {
        console.error("Failed to fetch details:", error);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  const handleUpdate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      let avatarUrl = previewUrl; // Start with previewUrl if available

      // If a new avatar is selected (File type), process it with Pinata
      if (avatar && typeof avatar !== "string") {
        const avatarHash = await uploadToPinata(avatar); // Upload new avatar to Pinata
        avatarUrl = `https://gateway.pinata.cloud/ipfs/${avatarHash}`;
      }

      console.log("Using avatar URL:", avatarUrl);

      const availableFunctions = Object.keys(functionMappings).map(
        (functionKey) => {
          const { title, parameters } = functionMappings[functionKey];
          return {
            functionTitle: functionKey,
            functionName: title,
            functionParameters: parameters,
          };
        }
      );

      // Send the updated data to your API
      const agentResponse = await axios.put(
        `${config.BASE_URL}/api/assistants/${agentId}`,
        {
          name: formData.agentName, // Use formData fields
          instructions: formData.roleDescription,
          codeName: formData.codename,
          imageUrl: avatarUrl, // Use avatarUrl which is either previewUrl or new Pinata URL
          createdBy: userAddress,
          availableFunctions: availableFunctions,
          userAddress: userAddress,
          llmModel: formData.llmModel,
          llmProvider: formData.llmProvider,
        }
      );

      console.log("Agent updated successfully:", agentResponse.data);
      router.push("/myagents"); // Redirect after successful update
    } catch (error) {
      console.error("Error updating agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const [errors, setErrors] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    // avatar: "",
    functions: "",
    llmModel: "",
    llmProvider: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear corresponding error message
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() ? "" : `${field} is required.`,
    }));
  };

  // Function to trigger the file input dialog
  const handleIconClick = () => {
    fileInputRef.current?.click(); // Trigger the file input dialog programmatically
  };

  if (!functionContext) {
    throw new Error("ComponentA must be used within a FunctionProvider");
  }

  const { functionMappings, setFunctionMappings } = functionContext;

  // Log values or display them
  // console.log('Function Mappings:', functionMappings);

  const pinataApiKey = `${config.PINATA_API_KEY}`;
  const pinataSecretApiKey = `${config.PINATA_API_SECRET}`;

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const toggleGinTokenModal = () => {
    setIsGinModalOpen(!isGinModalOpen);
  };

  const handleDrop = (items: AgentFunction | AgentFunction[]) => {
    const itemsArray = Array.isArray(items) ? items : [items];

    // Check for duplicate items
    const duplicateItems = itemsArray.filter((item) =>
      selectedFunctions.some((f) => f.id === item.id)
    );

    if (duplicateItems.length > 0) {
      alert("You cannot add the same function multiple times.");
      return;
    }

    setSelectedFunctions((prev) => [...prev, ...itemsArray]);

    // Clear error if functions are added
    setErrors((prev) => ({ ...prev, functions: "" }));
  };

  const handleRemove = (id: string) => {
    setSelectedFunctions(selectedFunctions.filter((f) => f.id !== id));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file); // Set the selected file
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null); // Remove the selected avatar file
    setPreviewUrl(null); // Clear the preview URL
  };

  useEffect(() => {
    // Cleanup the object URL when the avatar changes or component unmounts
    return () => {
      if (avatar instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(avatar));
      }
    };
  }, [avatar]);

  const uploadToPinata = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: "AgentAvatar",
      keyvalues: {
        uploadedBy: "AgentBuilder",
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      throw new Error("Failed to upload image");
    }
  };

  const validateFields = () => {
    const newErrors = {
      agentName: formData.agentName.trim() ? "" : "Agent name is required.",
      codename: formData.codename.trim() ? "" : "Codename is required.",
      roleDescription: formData.roleDescription.trim()
        ? ""
        : "Role description is required.",
      llmModel: formData.llmModel.trim() ? "" : "LLM model is required.", // Added validation
      llmProvider: formData.llmProvider.trim()
        ? ""
        : "LLM provider is required.", // Added validation
      // avatar: avatar ? "" : "Avatar upload is required.",
      functions:
        selectedFunctions.length > 0
          ? ""
          : "At least one function must be selected.", // Ensure functions are validated as well
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const [isCreating, setIsCreating] = useState<boolean>(false); // New state to manage input disable

  const handleCreate = async () => {
    if (!validateFields()) return;

    if (!walletAddress) {
      console.log("User not authenticated or user address not available");
      return;
    }

    setLoading(true);
    setIsCreating(true); // Disable inputs when creating the agent

    try {
      // Payment process
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const erc20Contract = new ethers.Contract(
        config.ERC20_CONTRACT_ADDRESS,
        abi_erc20,
        signer
      );

      const adminAddress = config.GINTONIC_CONTRACT_ADDRESS; // Replace with the actual admin address
      const ginAmount = ethers.utils.parseUnits("500", 18); // 500 GIN

      const tx = await erc20Contract.transfer(adminAddress, ginAmount);
      console.log("Transaction sent, waiting for confirmation...");
      await tx.wait();

      console.log("Payment successful");
      toast.success("Payment successful! Creating new agent.");

      // Proceed with agent creation
      let avatarUrl = "";

      // If an avatar is selected, upload it and generate the URL
      if (avatar) {
        const avatarHash = await uploadToPinata(avatar);
        avatarUrl = `https://gateway.pinata.cloud/ipfs/${avatarHash}`;
      }

      const availableFunctions = Object.keys(functionMappings).map(
        (functionKey) => {
          const { title, parameters } = functionMappings[functionKey];
          return {
            functionTitle: functionKey,
            functionName: title,
            functionParameters: parameters,
          };
        }
      );

      // Send the data to your API
      const agentResponse = await axios.post(
        `${config.BASE_URL}/api/assistants`,
        {
          name: formData.agentName,
          instructions: formData.roleDescription,
          codeName: formData.codename,
          imageUrl: avatarUrl,
          createdBy: walletAddress,
          availableFunctions: availableFunctions,
          userAddress: walletAddress,
          llmModel: formData.llmModel,
          llmProvider: formData.llmProvider,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Include JWT token in Authorization header
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Agent created successfully:", agentResponse.data);
      toast.success(
        "Agent created successfully! Redirecting to your agents page."
      );

      // Add a small delay before redirecting to ensure the user sees the toast
      setTimeout(() => {
        router.push("/myagents");
      }, 3000); // Redirect after successful creation
    } catch (error) {
      console.error("Error during payment or agent creation:", error);
      toast.error("Failed to create agent. Please try again.");
    } finally {
      setLoading(false);
      setIsCreating(false); // Re-enable inputs after creation
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="space-y-4 text-center pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary ">
            AI Agents BUILDER
          </h1>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Create your custom AI agent using drag and drop function
          </p>
        </div>
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-3 space-y-6 bg-[#151515] p-6 rounded-md overflow-y-auto h-[680px]">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Agent Details
              </h2>
              <Label className="mt-4 text-md">Agent Name</Label>
              <Input
                placeholder="Agent name"
                value={formData.agentName}
                onChange={(e) => handleChange("agentName", e.target.value)}
              />

              {errors.agentName && (
                <p className="text-red-500 text-sm mt-1">{errors.agentName}</p>
              )}
              <br />
              <Label className="mt-4 text-md">Codename</Label>
              <Input
                placeholder="Codename"
                value={formData.codename}
                onChange={(e) => handleChange("codename", e.target.value)}
              />

              {errors.codename && (
                <p className="text-red-500 text-sm mt-1">{errors.codename}</p>
              )}
              <br />
              {/* LLM Provider Dropdown */}
              <Label className="mt-4 text-md">LLM Provider</Label>
              <select
                value={formData.llmProvider}
                onChange={(e) => handleChange("llmProvider", e.target.value)}
                className="block w-full rounded-md border-none bg-inputbg px-3 py-2 outline-none"
              >
                <option value="">Select Provider</option>
                {Object.keys(llmProviders).map((provider) => (
                  <option key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>

              {errors.llmProvider && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.llmProvider}
                </p>
              )}
              <br />
              {/* LLM Model Dropdown */}
              <Label className="mt-4 text-md">LLM Model</Label>
              <select
                value={formData.llmModel}
                onChange={(e) => handleChange("llmModel", e.target.value)}
                className="block w-full rounded-md border-none bg-inputbg px-3 py-2 outline-none"
                disabled={!formData.llmProvider} // Disable if no provider is selected
              >
                <option value="">Select Model</option>
                {formData.llmProvider &&
                  llmProviders[
                    formData.llmProvider as keyof typeof llmProviders
                  ].map((model: string) => (
                    <option key={model} value={model}>
                      {model.charAt(0).toUpperCase() + model.slice(1)}
                    </option>
                  ))}
              </select>

              {errors.llmModel && (
                <p className="text-red-500 text-sm mt-1">{errors.llmModel}</p>
              )}
              <br />
              <Label className="mt-4 text-md">Role Description</Label>
              <Textarea
                placeholder="Describe agent's role and capabilities"
                className="h-24"
                value={formData.roleDescription}
                onChange={(e) =>
                  handleChange("roleDescription", e.target.value)
                }
              />

              {errors.roleDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.roleDescription}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 overflow-hidden">
                <div
                  className="h-12 w-12 rounded-md p-2 bg-[#282828] border border-border flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={handleIconClick} // Trigger the file input dialog when clicking the div
                >
                  {avatar || previewUrl ? (
                    <img
                      src={
                        previewUrl ||
                        (avatar instanceof File
                          ? URL.createObjectURL(avatar)
                          : "")
                      }
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Upload className="text-white" width={24} height={24} />
                  )}
                </div>
                <div className="flex flex-col">
                  <p
                    className="text-foreground cursor-pointer text-lg"
                    onClick={handleIconClick}
                  >
                    Upload AI Avatar
                  </p>
                  {avatar || previewUrl ? (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200">
                        {avatar
                          ? avatar.name.length > 6
                            ? `${avatar.name.slice(0, 7)}.${avatar.name.split(".").pop()}`
                            : avatar.name
                          : previewUrl && previewUrl.length > 6
                            ? `${previewUrl.slice(0, 9)}`
                            : previewUrl}
                      </p>
                      <button
                        onClick={handleRemoveAvatar}
                        className="text-foreground"
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={fileInputRef} // Assign the ref to the input element
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden" // Hide the input field
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-6 min-h-full">
            <DropZone
              onDrop={handleDrop}
              selectedFunctions={selectedFunctions}
              onRemove={handleRemove}
            />
            {errors.functions && (
              <p className="text-red-500 text-sm mt-1">{errors.functions}</p>
            )}
          </div>
          <div className="col-span-1 md:col-span-3 space-y-6 bg-[#151515] p-6 rounded-md overflow-y-auto flex flex-col h-[680px]">
            <div className="bg-[#151515] rounded-md flex-grow">
              <div className="flex justify-between mb-6">
                {/* Text Section */}
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-gray-100 ">
                    Functions
                  </p>
                  <p className="text-sm text-gray-400 ">Core System</p>
                </div>

                {/* Button Section */}
                <div
                  className="flex px-2 gap-2 rounded-2xl items-center h-10 bg-inputbg cursor-pointer"
                  onClick={toggleModal}
                >
                  <img
                    src="/images/code.svg"
                    alt="code"
                    className="w-6 h-auto"
                  />
                  <p className="text-gray-100 font-medium">agent api</p>
                </div>
              </div>

              <div className="space-y-5">
                {availableFunctions.map((func) => (
                  <DraggableFunction key={func.id} func={func} />
                ))}
              </div>
            </div>
            <div className="rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Agent Cost: 500 GIN
              </p>

              {agentId ? (
                <Button
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
                  onClick={handleUpdate} // Function to handle the update action
                  disabled={loading} // Disable the button while loading
                >
                  {loading ? "Updating..." : "Update Agent"}
                </Button>
              ) : authenticated ? (
                <>
                  {parseFloat(balance) >= 500 ? (
                    <Button
                      className="w-full mt-4 bg-foreground"
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Agent"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full mt-4 bg-primary text-primary-foreground hover:bg-warning/90 flex gap-1"
                      onClick={toggleGinTokenModal} // Function to handle adding tokens
                    >
                      Add Token
                    </Button>
                  )}
                  {responseMessage && (
                    <p className="text-center text-sm mt-2 text-primary">
                      {responseMessage}
                    </p>
                  )}
                </>
              ) : (
                <Button
                  className="w-full bg-primary mt-4 text-primary-foreground hover:bg-primary/90 flex gap-1"
                  onClick={login}
                >
                  <Image
                    src="/images/connect.svg"
                    alt="connect"
                    width={22}
                    height={16}
                  />
                  Connect MetaMask
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AgentApiModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        formData={formData}
      />

      {isGinModalOpen && (
        <Modal isOpen={isGinModalOpen} onClose={toggleGinTokenModal} />
      )}
    </div>
  );
}
