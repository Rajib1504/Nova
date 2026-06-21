"use client";

import React, { useEffect, useState } from "react";
import { TopHeader } from "@/components/workspace/TopHeader";
import { BlobButton } from "@/components/BlobButton";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Mail, Calendar, Server } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [connections, setConnections] = useState<{
    gmail: { isConnected: boolean; updatedAt: string | null };
    googlecalendar: { isConnected: boolean; updatedAt: string | null };
  }>({
    gmail: { isConnected: false, updatedAt: null },
    googlecalendar: { isConnected: false, updatedAt: null },
  });
  const [isLoading, setIsLoading] = useState(true);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (session) {
      fetchConnections();
    }
  }, [theme, session]);

  const fetchConnections = async () => {
    try {
      const res = await axios.get("/api/settings/connections");
      setConnections(res.data);
    } catch (error) {
      console.error("Failed to fetch connections", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = (plugin: string) => {
    window.location.href = `/api/connect?plugin=${plugin}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF5E4] dark:bg-[#121418] text-[#2D2A26] dark:text-[#F0EEEC] flex flex-col font-sans transition-colors overflow-hidden">
      <TopHeader
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-black/10 dark:border-white/10 p-6 flex flex-col gap-2 shrink-0">
          <h2 className="text-xl font-bold font-heading mb-6 text-gray-900 dark:text-white">Settings</h2>
          
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white font-medium shadow-sm transition-colors">
            <Server className="w-5 h-5 text-[#FF9494]" />
            Integrations
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-white/40 dark:bg-[#1A1D23]/40">
          <div className="max-w-3xl flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2">Integrations & Connections</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your connected services to allow Nova to orchestrate your workflow.</p>
            </div>

            {isLoading ? (
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#FF9494] border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 font-medium">Loading connections...</span>
               </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Gmail Card */}
                <div className="bg-[#FFF5E4] dark:bg-[#1A1D23] border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#23232A] rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-black/5 dark:border-white/5">
                      <Mail className="w-6 h-6 text-[#FF9494]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Gmail</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Allow Nova to read, organize, and draft emails.</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connections.gmail.isConnected ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {connections.gmail.isConnected ? "Connected" : "Disconnected"}
                        </span>
                        {connections.gmail.updatedAt && (
                          <span className="text-xs text-gray-400">
                            • Last connected {formatDistanceToNow(new Date(connections.gmail.updatedAt))} ago
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <BlobButton size="sm" onClick={() => handleReconnect("gmail")}>
                    {connections.gmail.isConnected ? "Reconnect Gmail" : "Connect Gmail"}
                  </BlobButton>
                </div>

                {/* Calendar Card */}
                <div className="bg-[#FFF5E4] dark:bg-[#1A1D23] border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#23232A] rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-black/5 dark:border-white/5">
                      <Calendar className="w-6 h-6 text-[#FF9494]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Google Calendar</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Allow Nova to sync events and schedule meetings.</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connections.googlecalendar.isConnected ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {connections.googlecalendar.isConnected ? "Connected" : "Disconnected"}
                        </span>
                        {connections.googlecalendar.updatedAt && (
                          <span className="text-xs text-gray-400">
                            • Last connected {formatDistanceToNow(new Date(connections.googlecalendar.updatedAt))} ago
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <BlobButton size="sm" onClick={() => handleReconnect("googlecalendar")}>
                    {connections.googlecalendar.isConnected ? "Reconnect Calendar" : "Connect Calendar"}
                  </BlobButton>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
