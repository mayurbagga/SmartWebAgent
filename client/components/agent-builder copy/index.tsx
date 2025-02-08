"use client";
import { useState, useContext, useRef } from "react";
import { ArrowLeft, Plus, Upload, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DraggableFunction } from "./draggable-function";
import { DropZone } from "./drop-zone";
import Link from "next/link";
import { Modal } from "../Modal";
import { Label } from "../ui/label";
import Image from "next/image";
import { Header } from "../ui/header";
import axios from "axios";
import config from "@/config/config";
import { FunctionContext } from '../../contexts/FunctionContext';
import { usePrivy } from "@privy-io/react-auth";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AgentApiModal } from "../AgentApiModal ";

export interface AgentFunction {
  id: string;
  name: string;
  description: string;
  type: "text" | "vision" | "decision";
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

export default function AgentBuilder() {

  const [formData, setFormData] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
  });

  const [selectedFunctions, setSelectedFunctions] = useState<AgentFunction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // const [agentName, setAgentName] = useState<string>("");
  // const [codename, setCodename] = useState<string>("");
  // const [roleDescription, setRoleDescription] = useState<string>("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");



  const [errors, setErrors] = useState({
    agentName: "",
    codename: "",
    roleDescription: "",
    avatar: "",
    functions: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear corresponding error message
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() ? "" : `${field} is required.`,
    }));
  };


  const { authenticated, login, logout, user } = usePrivy();
  const router = useRouter();

  const walletAddress = user?.wallet?.address;

  const functionContext = useContext(FunctionContext);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Function to trigger the file input dialog
  const handleIconClick = () => {
    fileInputRef.current?.click(); // Trigger the file input dialog programmatically
  };

  if (!functionContext) {
    throw new Error('ComponentA must be used within a FunctionProvider');
  }

  const { functionMappings, setFunctionMappings } = functionContext;

  // Log values or display them
  console.log('Function Mappings:', functionMappings);



  const pinataApiKey = `${config.PINATA_API_KEY}`;
  const pinataSecretApiKey = `${config.PINATA_API_SECRET}`;

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
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
      setAvatar(file);
      setErrors((prev) => ({ ...prev, avatar: "" })); // Clear avatar error
    }
  };


  const handleRemoveAvatar = () => {
    setAvatar(null); // Remove the selected avatar
  };


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
      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });
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
      roleDescription: formData.roleDescription.trim() ? "" : "Role description is required.",
      avatar: avatar ? "" : "Avatar upload is required.",
      functions: selectedFunctions.length > 0 ? "" : "At least one function must be selected.", // Ensure functions are validated as well
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleCreate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      let avatarUrl = "";

      // If an avatar is selected, upload it and generate the URL
      if (avatar) {
        const avatarHash = await uploadToPinata(avatar);
        avatarUrl = `https://gateway.pinata.cloud/ipfs/${avatarHash}`;
      }

      const availableFunctions = Object.keys(functionMappings).map((functionKey) => {
        const { title, parameters } = functionMappings[functionKey];
        return {
          functionTitle: functionKey,
          functionName: title,
          functionParameters: parameters,
        };
      });

      // Send the data to your API
      const agentResponse = await axios.post(`${config.BASE_URL}/api/assistants`, {
        name: formData.agentName,  // Use formData fields
        instructions: formData.roleDescription,
        codeName: formData.codename,
        imageUrl: avatarUrl,
        createdBy: walletAddress,
        availableFunctions: availableFunctions,
        userAddress: walletAddress,
      });

      const agentId = agentResponse.data.data._id;

      // Reset formData fields
      setFormData({
        agentName: "",
        codename: "",
        roleDescription: "",
      });

      // Reset form data
      setAvatar(null);
      setSelectedFunctions([]);

      // Navigate to "myagents"
      router.push("/myagents");
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setLoading(false);
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
          <div className="col-span-1 md:col-span-3 space-y-6 bg-[#151515] p-6 rounded-md h-auto md:h-[500px] overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Agent Details
              </h2>
              <Label className="mt-4">Agent Name</Label>
              <Input
                placeholder="Agent name"
                value={formData.agentName}
                onChange={(e) => handleChange("agentName", e.target.value)}
              />
              
              {errors.agentName && <p className="text-red-500 text-sm mt-1">{errors.agentName}</p>}
              <br />
              <Label className="mt-4">Codename</Label>
              <Input
                placeholder="Codename"
                value={formData.codename}
                onChange={(e) => handleChange("codename", e.target.value)}
              />
             
              {errors.codename && <p className="text-red-500 text-sm mt-1">{errors.codename}</p>}
              <br />
              <Label className="mt-4">Role Description</Label>
              <Textarea
                placeholder="Describe agent's role and capabilities"
                className="h-24"
                value={formData.roleDescription}
                onChange={(e) => handleChange("roleDescription", e.target.value)}
              />
              
              {errors.roleDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.roleDescription}</p>
              )}
              <div className="flex items-center gap-2 pt-4 overflow-hidden">
                <div
                  className="h-12 w-12 rounded-md p-2 bg-[#282828] border border-border flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={handleIconClick} // Trigger the file input dialog when clicking the div
                >
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      key={avatar.name}
                    />
                  ) : (
                    // Show the upload icon when no image is uploaded
                    <Upload className="text-white" width={24} height={24} />
                  )}
                </div>

                <div className="flex flex-col">
                  <p className="text-foreground">Upload AI Avatar</p>
                  {avatar ? (
                    <div className="flex items-center gap-2">
                      <p className="text-gray-200">
                        {avatar.name.length > 6
                          ? `${avatar.name.slice(0, 7)}.${avatar.name.split('.').pop()}`
                          : avatar.name}
                      </p>
                      <button onClick={handleRemoveAvatar} className="text-foreground">
                        ✖
                      </button>
                    </div>
                  ) : (
                    // Hidden file input for selecting the image
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
              {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
            </div>
          </div>
          <div className="col-span-1 md:col-span-6 min-h-[500px]">
            <DropZone
              onDrop={handleDrop}
              selectedFunctions={selectedFunctions}
              onRemove={handleRemove}
            />
            {errors.functions && <p className="text-red-500 text-sm mt-1">{errors.functions}</p>}
          </div>
          <div className="col-span-1 md:col-span-3 space-y-6 h-auto md:h-[500px]">
            <div className="bg-[#151515] p-6 rounded-md">
              <div className="flex justify-between mb-2">
                {/* Text Section */}
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-gray-100 ">Functions</p>
                  <p className="text-sm text-gray-400 ">Core System</p>
                </div>

                {/* Button Section */}
                <div className="flex px-2 gap-2 rounded-2xl items-center h-10 bg-inputbg cursor-pointer" onClick={toggleModal}>
                  <img
                    src="/images/code.svg"
                    alt="code"
                    className="w-6 h-auto"
                  />
                  <p className="text-gray-100 font-medium">agent api</p>
                </div>
              </div>

              <div className="space-y-3">
                {availableFunctions.map((func) => (
                  <DraggableFunction key={func.id} func={func} />
                ))}
              </div>

            </div>
            <div className="bg-card/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Agent Cost: 500 GIN
              </p>

              {authenticated ? (
                <>
                  <Button
                    className="w-full mt-4 bg-foreground"
                    onClick={handleCreate}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Agent"}
                  </Button>
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
                  <Image src="/images/connect.svg" alt="connect" width={22} height={16} />

                  Connect MetaMask
                </Button>
              )}

            </div>
          </div>
        </div>
      </div>

      <AgentApiModal isOpen={isModalOpen} onClose={toggleModal} formData={formData} />
    </div>
  );
}


