"use client";

import { useDrag } from "react-dnd";
import { Card } from "@/components/ui/card";
import { GripHorizontal , Grip , } from "lucide-react";
import type { AgentFunction } from "./index";

interface DraggableFunctionProps {
  func: AgentFunction;
}

export function DraggableFunction({ func }: DraggableFunctionProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "function",
    item: func,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-3 cursor-move bg-inputbg hover:bg-accent">
        <div className="flex items-start gap-3">
          <Grip className="h-5 w-5 text-muted-foreground mt-0.5" />
        
          <div>
            <h3 className="font-medium">{func.name}</h3>
            <p className="text-sm text-muted-foreground">{func.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}