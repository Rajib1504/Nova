"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopHeader } from "../workspace/TopHeader";
import { toggleThemeWithTransition } from "@/utils/theme";
import { Calendar, Clock, Inbox, Sparkles, CheckCircle2, ArrowRight, BarChart3, Mail, BrainCircuit } from "lucide-react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export const CommandCenter = () => {
  const [theme, setTheme] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalEmailsTriaged: 0, timeSaved: "0m", meetingsScheduled: 0 });
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [emailChartData, setEmailChartData] = useState<any[]>([]);
  const [aiObservation, setAiObservation] = useState<string>("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nova-theme");
    if (savedTheme === "light") {
      setTheme("light");
    } else {
      setTheme("dark");
    }

    // Fetch Dashboard Data
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/command-center");
        if (res.data.success) {
          setMetrics(res.data.metrics);
          setActionItems(res.data.actionItems);
          setMeetings(res.data.upcomingMeetings);
          setChartData(res.data.chartData || []);
          setEmailChartData(res.data.emailChartData || []);
          setAiObservation(res.data.aiObservation || "");
        }
      } catch (error) {
        console.error("Failed to load command center data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    toggleThemeWithTransition(e, theme, setTheme);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-transparent text-[#2D2A26] dark:text-[#F0EEEC] font-sans transition-colors duration-500">
      <TopHeader
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Executive Briefing</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Your week at a glance, synthesized by Nova AI.</p>
            </div>
            
            <div className="glass px-6 py-4 rounded-2xl border border-white/20 shadow-lg bg-white/40 dark:bg-black/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF9494]/20 flex items-center justify-center text-[#FF9494]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Neural Core Active</p>
                <p className="text-xs text-[#FF9494] font-medium">All systems nominal</p>
              </div>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Emails Triaged", value: loading ? "-" : metrics.totalEmailsTriaged, icon: Inbox, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Time Saved", value: loading ? "-" : metrics.timeSaved, icon: Clock, color: "text-[#FF9494]", bg: "bg-[#FF9494]/10" },
              { label: "Meetings Scheduled", value: loading ? "-" : metrics.meetingsScheduled, icon: Calendar, color: "text-green-500", bg: "bg-green-500/10" }
            ].map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border border-white/20 shadow-[8px_8px_16px_#E5DCD0,-8px_-8px_16px_#FFFFFF] dark:shadow-[8px_8px_16px_#121418,-8px_-8px_16px_#22262e] bg-white/50 dark:bg-[#23232A]/50 flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{metric.label}</p>
                  <p className="text-3xl font-black font-heading mt-1">{metric.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl border border-white/20 shadow-lg bg-white/40 dark:bg-[#23232A]/40 overflow-hidden flex flex-col p-6"
          >
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Meeting Schedule Progress
                </h2>
                <div className="text-sm text-gray-500 font-medium">Last 4 Weeks vs Previous Period</div>
             </div>
             
             <div className="w-full h-[250px]">
               {loading ? (
                  <div className="w-full h-full flex justify-center items-center"><Sparkles className="w-6 h-6 animate-spin text-indigo-500" /></div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#ffffff10' : '#00000010'} vertical={false} />
                     <XAxis dataKey="name" stroke={theme === 'dark' ? '#ffffff50' : '#00000050'} fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke={theme === 'dark' ? '#ffffff50' : '#00000050'} fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                       contentStyle={{ 
                         backgroundColor: theme === 'dark' ? '#1A1D23' : '#ffffff', 
                         borderRadius: '12px',
                         border: '1px solid rgba(255,255,255,0.1)',
                         boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                       }}
                     />
                     <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                     <Line type="monotone" dataKey="current" name="This Month" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="previous" name="Last Month" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} />
                   </LineChart>
                 </ResponsiveContainer>
               )}
             </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Priority Email Comparison */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl border border-white/20 shadow-lg bg-white/40 dark:bg-[#23232A]/40 overflow-hidden flex flex-col p-6"
            >
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-500" />
                    Priority Email Volume
                  </h2>
               </div>
               
               <div className="w-full h-[200px]">
                 {loading ? (
                    <div className="w-full h-full flex justify-center items-center"><Sparkles className="w-6 h-6 animate-spin text-orange-500" /></div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={emailChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#ffffff10' : '#00000010'} vertical={false} />
                       <XAxis dataKey="name" stroke={theme === 'dark' ? '#ffffff50' : '#00000050'} fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke={theme === 'dark' ? '#ffffff50' : '#00000050'} fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: theme === 'dark' ? '#1A1D23' : '#ffffff', 
                           borderRadius: '12px',
                           border: '1px solid rgba(255,255,255,0.1)',
                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                         }}
                       />
                       <Line type="monotone" dataKey="current" name="This Month" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                       <Line type="monotone" dataKey="previous" name="Last Month" stroke="#fdba74" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 )}
               </div>
            </motion.div>

            {/* AI Observation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl border border-white/20 shadow-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 overflow-hidden flex flex-col p-8 relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold font-heading tracking-wide">
                    AI Observation Over Your Progress
                  </h2>
               </div>
               <div className="flex-1 relative z-10">
                 {loading ? (
                    <div className="w-full h-[150px] flex justify-center items-center"><Sparkles className="w-6 h-6 animate-spin text-indigo-500" /></div>
                 ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.5 }}
                      className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {aiObservation}
                    </motion.p>
                 )}
               </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Critical Action Items */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl border border-white/20 shadow-lg bg-white/40 dark:bg-[#23232A]/40 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FF9494]" />
                  Critical Action Items
                </h2>
                <span className="px-3 py-1 bg-[#FF9494]/10 text-[#FF9494] text-xs font-bold rounded-full">
                  HIGH PRIORITY
                </span>
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-[400px] space-y-4">
                {loading ? (
                  <div className="flex justify-center p-8"><Sparkles className="w-6 h-6 animate-spin text-[#FF9494]" /></div>
                ) : actionItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 font-medium">No critical action items. You are all caught up!</p>
                ) : (
                  actionItems.map((item, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-[#1A1D23]/60 p-4 rounded-2xl border border-white/40 dark:border-white/5 hover:border-[#FF9494]/30 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm truncate pr-4">{item.subject || "No Subject"}</h3>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.date ? format(parseISO(item.date), "MMM d, h:mm a") : ""}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{item.snippet}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.fromAddress?.split('<')[0]}</span>
                        <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#FF9494] transition-colors transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Upcoming Protocol Timeline */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl border border-white/20 shadow-lg bg-white/40 dark:bg-[#23232A]/40 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Protocol
                </h2>
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                {loading ? (
                  <div className="flex justify-center p-8"><Sparkles className="w-6 h-6 animate-spin text-blue-500" /></div>
                ) : meetings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 font-medium">No upcoming meetings scheduled.</p>
                ) : (
                  <div className="relative border-l-2 border-black/5 dark:border-white/10 ml-4 space-y-6">
                    {meetings.map((meeting, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="bg-white/60 dark:bg-[#1A1D23]/60 p-4 rounded-2xl border border-white/40 dark:border-white/5">
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 block">
                            {meeting.startTime ? format(parseISO(meeting.startTime), "EEEE, MMM d • h:mm a") : ""}
                          </span>
                          <h3 className="font-bold text-sm">{meeting.summary || "Untitled Event"}</h3>
                          {meeting.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              📍 {meeting.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
