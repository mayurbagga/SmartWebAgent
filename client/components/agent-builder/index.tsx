"use client";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
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
// import FunctionConfig from './FunctionConfig';
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
  const [selectedFunctions, setSelectedFunctions] = useState<AgentFunction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };
  const handleDrop = (items: AgentFunction | AgentFunction[]) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    itemsArray.forEach(item => {
      if (!selectedFunctions.find(f => f.id === item.id)) {
        setSelectedFunctions(prev => [...prev, item]);
      }
    });
  };
  const handleRemove = (id: string) => {
    setSelectedFunctions(selectedFunctions.filter(f => f.id !== id));
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="space-y-4 text-center pt-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary ">AI Agents BUILDER</h1>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Create your custom AI agent using drag and drop function
          </p>
        </div>
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-3 space-y-6 bg-[#151515] p-6 rounded-md h-auto md:h-[500px] overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-primary mb-4">Agent Details</h2>
              <Label className="mt-4">Agent Name</Label>
              <Input placeholder="Agent name" />
              <br />
              <Label className="mt-4">CodeName</Label>
              <Input placeholder="Codename" />
              <br />
              <Label className="mt-4">Role Description</Label>
              <Textarea
                placeholder="Describe agent's role and capabilities"
                className="h-24"
              />
              <div className="flex items-center gap-2 pt-4">
                <div
                  className="h-12 w-12 rounded-md p-2 bg-[#282828] border border-border flex items-center justify-center overflow-hidden"
                  style={{ zIndex: 10 }}
                >
                  <Image
                    src="/images/agent_6.svg"
                    alt="profile"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-foreground">Upload AI Avatar</p>
                  <p className="text-muted-foreground text-sm">Select photo 200*200</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-6 min-h-[500px]">
            <DropZone
              onDrop={handleDrop}
              selectedFunctions={selectedFunctions}
              onRemove={handleRemove}
            />
          </div>
          <div className="col-span-1 md:col-span-3 space-y-6 h-auto md:h-[500px]">
            <div className="bg-[#151515] p-6 rounded-md">
              <h2 className="text-lg font-semibold text-foreground mb-2">Available Functions</h2>
              <p className="text-sm text-muted-foreground my-2">
                Core System
              </p>
              <div className="space-y-3">
                {availableFunctions.map((func) => (
                  <DraggableFunction key={func.id} func={func} />
                ))}
              </div>
            </div>
            <div className="bg-card/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">Agent Cost: 500 GIN</p>
              <Button className="w-full mt-4 bg-foreground">
                Create Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={toggleModal} />
    </div>
  );
}