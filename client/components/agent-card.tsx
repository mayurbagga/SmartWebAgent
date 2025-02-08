"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "@/node_modules/next/link";

interface AgentCardProps {
  title: string;
  codename: string;
  description: string;
  avatar: string;
  status: "Active" | "Inactive";
}

export default function AgentCard({ title, codename, description, avatar, status }: AgentCardProps) {
  const router = useRouter();

  const formattedTitle = title.replace(/\s+/g, '-');


  // const handleCardClick = () => {
  //   router.push(`/agentlist`);
  // };

  return (
    <div className="relative mt-10">
      {/* <Link href={`/agentlist/${formattedTitle}`}> */}
      <Link
        href={{
          pathname: '/agentdetail',
          query: { title },
        }}
      >
        <Card
          className="group relative overflow-hidden bg-card/50 hover:bg-card/80 transition-colors border border-border cursor-pointer"
        // onClick={handleCardClick} // Navigate on click
        >
          <div className="p-6 flex flex-col items-center">
            <div className="w-full flex justify-end mb-2">
              <Badge variant="outline" className="bg-secondary/50 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                {status}
              </Badge>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">Codename: {codename}</p>
              <p className="text-sm text-muted-foreground">
                {description.length > 35 ? `${description.substring(0, 35)}...` : description}
              </p>
            </div>
          </div>
        </Card>
      </Link>
      <div
        className="absolute h-12 w-12 rounded-md p-6 bg-[#282828] border border-border flex items-center justify-center overflow-hidden"
        style={{ top: '-25px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      >
        <Image
          src={avatar}
          alt={title}
          fill
          className="object-cover p-2"
        />
      </div>
    </div>
  );
}
