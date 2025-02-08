"use client";

import { useDrop } from "react-dnd";
import { X } from "lucide-react";
import type { AgentFunction } from "./index";
import FunctionConfig from "./FunctionConfig";
import { UserCircle2 } from "lucide-react";
import Image from "next/image";

interface DropZoneProps {
  onDrop: (item: AgentFunction) => void;
  selectedFunctions: AgentFunction[];
  onRemove: (id: string) => void;
}

export function DropZone({ onDrop, selectedFunctions, onRemove }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "function",
    drop: (item: AgentFunction) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`min-h-[500px] rounded-lg border-dashed border-2 ${
        isOver ? "border-accent bg-accent/10" : "border-muted"
      } transition-colors relative`}
    >
      <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed p-3">
      <div className="px-2 py-1 rounded-full bg-primary">
      <Image
          src="/images/Union.svg"
          alt="union"

        width={10}
        height={18}
          className="text-primary-foreground"
        />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Agent Configuration
            </h3>
          </div>
      {selectedFunctions.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          {/* Title and Icon */}
          
          {/* Drag and Drop Area */}
          <div className="flex flex-col items-center justify-center">
            {/* <div className="w-10 h-10 border-gray-500 rounded-md flex items-center justify-center mb-4">
              <X className="h-5 w-5 text-gray-500" />
            </div> */}
            <div>
             
            <p className="text-foreground">
              Drag functions here to build your agent
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your agent by adding and configuring functions
            </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {selectedFunctions.map((func) => (
            <FunctionConfig key={func.id} func={func} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
