"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { AgentGrid } from "@/components/agent-grid";

export default function AgentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
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
          <AgentGrid />
        </div>
      </div>
      {/* <footer className="border-t border-border mt-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-sm text-muted-foreground">
          <span>© 2025 - Gintonic</span>
          <a href="#" className="hover:text-foreground">Terms of use</a>
        </div>
      </footer> */}
    </div>
  );
}