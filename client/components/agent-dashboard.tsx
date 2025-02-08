"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { AgentGrid } from "@/components/agent-grid";
import config from "@/config/config";

interface Agent {
  _id: string;
  name: string;
  codeName: string;
  instructions: string;
  isActive: boolean;
  imageUrl: string;
}

export default function AgentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {

    console.log(" BASE_URL ", config.BASE_URL)
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{
          pages: any;
          page: number;
          pagination: any; success: boolean; data: Agent[];  
}>(
          `${config.BASE_URL}/api/assistants?page=${currentPage}&limit=6`
        );
        if (response.data.success) {
          setAgents(response.data.data);
          console.log("totalpages", response.data.pages)

          setTotalPages(response.data.pagination.pages);
          setCurrentPage(response.data.pagination.page);
          console.log("totalrecord", response.data.pagination.total)
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setErrorMessage("Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <div className="py-12 space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Gintonic AI Agents</h1>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Explore AI agents designed to help with various tasks and projects,
              or create your own customized solution to fit your needs.
            </p>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <AgentGrid
            searchQuery={searchQuery}
            agents={agents}
            loading={loading}
            errorMessage={errorMessage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
