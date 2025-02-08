"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AgentBuilder from "@/components/agent-builder";

export default function CreatePage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AgentBuilder />
    </DndProvider>
  );
}