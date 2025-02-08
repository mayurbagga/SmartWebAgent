"use client";

import AgentCard from "@/components/agent-card";
import { FEATURED_AGENTS } from "@/lib/constants";
// import Link from "@/node_modules/next/link";

export function AgentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {FEATURED_AGENTS.map((agent) => (
        <AgentCard key={agent.title} {...agent} />
      ))}
    </div>
  );
}
