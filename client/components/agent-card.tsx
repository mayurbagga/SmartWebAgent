"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import { usePathname } from "next/navigation";
// import { Button } from "./ui/button";

interface AgentCardProps {
  agent: {
    _id: string;
    name: string;
    codeName: string;
    instructions: string;
    isActive: boolean;
    imageUrl: string;
  };
}

export default function AgentCard({ agent }: AgentCardProps) {
  const pathname = usePathname();
  // const formattedTitle = agent.name.replace(/\s+/g, "-");
  const id = agent._id;

  return (
    <div className="relative mt-10">
      <Link
        href={{
          pathname: "/agentdetail",
          query: { id },
        }}
      >
        <Card className="group relative overflow-hidden bg-card/50 hover:bg-card/80 transition-colors border border-border cursor-pointer">
          <div className="p-6 flex flex-col items-center">
            <div className="w-full flex justify-end mb-2">
              <Badge
                variant="outline"
                className={`flex items-center gap-2 ${
                  agent.isActive ? "bg-secondary/50" : "bg-gray-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    agent.isActive ? "bg-primary" : "bg-gray-400"
                  }`}
                ></span>
                {agent.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                Codename: {agent.codeName}
              </p>
              <p className="text-sm text-muted-foreground">
                {agent.instructions.length > 35
                  ? `${agent.instructions.substring(0, 35)}...`
                  : agent.instructions}
              </p>
            </div>
            {pathname === "/myagents" && (
              <div className="flex justify-center">
                <Link
                  href={{
                    pathname: "/create",
                    query: { id: agent._id }, // Pass the ID as a query parameter
                  }}
                >
                  <button className="bg-primary px-3 py-1 rounded-lg text-sm text-primary-foreground mt-3 flex justify-center items-center gap-2">
                    <SquarePen className="w-4 h-4" />
                    Edit
                  </button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        <div
          className="absolute h-12 w-12 rounded-md p-6 bg-[#282828] border border-border flex items-center justify-center overflow-hidden"
          style={{
            top: "-25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <Image
            src={agent.imageUrl || "/images/agent_6.svg"} // Fallback to default image if imageUrl is not provided
            alt={agent.name}
            fill
            className="object-cover p-2"
          />
        </div>
      </Link>
    </div>
  );
}
