"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Video } from "lucide-react";

interface CalendarPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const DAYS = [
  { day: "MON", date: "21" },
  { day: "TUE", date: "22", active: true },
  { day: "WED", date: "23" },
  { day: "THU", date: "24" },
  { day: "FRI", date: "25" },
];

const MEETINGS = [
  {
    id: 1,
    title: "Product Sync",
    dayIndex: 1, // TUE
    startHour: 10,
    durationHours: 1.5,
    attendees: ["Sarah J.", "Mike T."],
    link: "meet.google.com/abc-xyz",
  },
  {
    id: 2,
    title: "Sprint Prep",
    dayIndex: 3, // THU
    startHour: 9,
    durationHours: 1,
    attendees: ["Engineering Team"],
    link: "meet.google.com/def-uvw",
  },
  {
    id: 3,
    title: "Global Review",
    dayIndex: 2, // WED
    startHour: 12,
    durationHours: 2,
    attendees: ["Exec Board"],
    link: "meet.google.com/ghi-rst",
  },
];

export const CalendarPanel: React.FC<CalendarPanelProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);

  // Constants for timeline rendering
  const ROW_HEIGHT = 60; // 60px per hour

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      
      {/* Header Controls */}
      <div className="p-4 flex flex-col gap-4 border-b border-white/20 dark:border-white/5 shrink-0">
        <div className="flex justify-between items-center h-8">
          <button 
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
          >
            {isCollapsed ? "←" : "→"}
          </button>
          
          {!isCollapsed && (
            <div className="flex gap-2">
              <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Day
                </button>
                <button className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-[#23232A] text-gray-900 dark:text-white shadow-sm">
                  Week
                </button>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex justify-between items-center px-1">
            <span className="font-heading font-bold text-lg tracking-tight">October 2024</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsed State: Icon Rail */}
        {isCollapsed ? (
          <div className="w-full py-4 flex flex-col items-center gap-4 border-l border-white/20 dark:border-white/5">
            <button className="w-10 h-10 rounded-xl bg-[#FFE3E1] dark:bg-[#FF9494]/20 text-[#FF9494] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </button>
            <div className="w-full border-t border-white/20 dark:border-white/5 my-2" />
            <div className="flex flex-col gap-2 w-full px-2">
              {MEETINGS.map((m) => (
                <div key={m.id} className="w-full h-10 rounded-lg bg-white/40 dark:bg-white/5 border border-[#FF9494]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 dark:hover:bg-white/10" title={m.title}>
                  <span className="text-[10px] font-bold text-[#FF9494]">{m.startHour}:00</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Expanded State: Full Calendar */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Offline Connection Prompt */}
            <div className="mx-4 mt-4 mb-2 p-4 glass bg-white/80 dark:bg-[#23232A]/90 border border-[#FF9494]/40 shadow-[0_4px_20px_rgba(255,148,148,0.1)] rounded-2xl shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative overflow-hidden z-20">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF9494]" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Neural Core Offline
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Connect your Google Calendar to initialize autonomous scheduling.
                </p>
              </div>
              <a 
                href="/api/connect?plugin=google-calendar" 
                className="px-4 py-2 bg-gradient-to-r from-[#FF7B7B] to-[#FF9494] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-[0_8px_15px_rgba(255,148,148,0.3)] hover:-translate-y-0.5 transition-all whitespace-nowrap shrink-0"
              >
                Connect Calendar
              </a>
            </div>

            {/* Days Header */}
            <div className="flex border-b border-white/20 dark:border-white/5 shrink-0 pl-14">
              {DAYS.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
                  <span className={`text-[10px] font-bold tracking-widest ${day.active ? "text-[#FF9494]" : "text-gray-500 dark:text-gray-400"}`}>
                    {day.day}
                  </span>
                  <span className={`text-lg font-heading font-bold ${day.active ? "text-[#2D2A26] dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                    {day.date}
                  </span>
                  {day.active && <div className="w-1 h-1 rounded-full bg-[#FF9494] mt-1" />}
                </div>
              ))}
            </div>

            {/* Timeline Scroll Area */}
            <div className="flex-1 overflow-y-auto relative pb-20 scroll-smooth">
              <div className="flex relative min-w-[500px]" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>
                
                {/* Time Column */}
                <div className="w-14 flex flex-col border-r border-white/20 dark:border-white/5 bg-transparent sticky left-0 z-10">
                  {HOURS.map((hour) => (
                    <div key={hour} className="w-full flex justify-center items-start text-[10px] font-semibold text-gray-400 dark:text-gray-500 pr-2 -mt-1.5" style={{ height: ROW_HEIGHT }}>
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                    </div>
                  ))}
                </div>

                {/* Grid Lines & Active Time Indicator */}
                <div className="flex-1 relative">
                  {HOURS.map((hour, i) => (
                    <div key={hour} className="w-full border-t border-white/20 dark:border-white/5" style={{ height: ROW_HEIGHT }} />
                  ))}

                  {/* Active Current Time Line (Dummy Data: 10:30 AM on Tue) */}
                  <div className="absolute w-full flex items-center pointer-events-none z-0" style={{ top: `${(10.5 - 8) * ROW_HEIGHT}px` }}>
                    <div className="w-2 h-2 rounded-full bg-[#FF9494] -ml-1 shadow-[0_0_8px_rgba(255,148,148,0.8)]" />
                    <div className="h-[1px] w-full bg-[#FF9494] shadow-[0_0_5px_rgba(255,148,148,0.5)]" />
                  </div>

                  {/* Meeting Blocks */}
                  {MEETINGS.map((meeting) => {
                    const topPos = (meeting.startHour - 8) * ROW_HEIGHT;
                    const heightPos = meeting.durationHours * ROW_HEIGHT;
                    const leftPos = (meeting.dayIndex / DAYS.length) * 100;
                    const widthPos = 100 / DAYS.length;

                    const isSelected = selectedMeeting === meeting.id;

                    return (
                      <div
                        key={meeting.id}
                        className="absolute p-1 z-10"
                        style={{
                          top: `${topPos}px`,
                          height: `${heightPos}px`,
                          left: `${leftPos}%`,
                          width: `${widthPos}%`,
                        }}
                      >
                        <motion.div
                          onClick={() => setSelectedMeeting(isSelected ? null : meeting.id)}
                          whileHover={{ scale: 1.02, zIndex: 20 }}
                          className={`relative w-full h-full rounded-xl glass border border-white/60 dark:border-white/10 shadow-sm cursor-pointer overflow-hidden transition-colors flex flex-col p-2.5
                            ${isSelected ? "bg-white/90 dark:bg-[#2A2D35] ring-1 ring-[#FF9494]/50 shadow-lg" : "bg-[#FFE3E1]/70 dark:bg-[#1A1D23]/70 hover:bg-white/60 dark:hover:bg-[#23232A]"}`}
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF9494]" />
                          <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight mb-1">
                            {meeting.title}
                          </span>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                            {meeting.startHour > 12 ? meeting.startHour - 12 : meeting.startHour}:00 - {meeting.startHour + meeting.durationHours > 12 ? (meeting.startHour + meeting.durationHours) - 12 : meeting.startHour + meeting.durationHours}:00
                          </span>
                        </motion.div>

                        {/* Meeting Popover */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-1/2 left-full ml-4 -translate-y-1/2 w-64 glass bg-white/95 dark:bg-[#23232A]/95 border border-white/60 dark:border-white/10 rounded-2xl shadow-xl p-4 z-50 pointer-events-auto"
                            >
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{meeting.title}</h4>
                              
                              <div className="flex flex-col gap-2 mb-4">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <Clock className="w-3.5 h-3.5 text-[#FF9494]" />
                                  {DAYS[meeting.dayIndex].day}, {meeting.startHour}:00 - {meeting.startHour + meeting.durationHours}:00
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <Users className="w-3.5 h-3.5 text-[#FF9494]" />
                                  {meeting.attendees.join(", ")}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-blue-500 hover:underline cursor-pointer truncate">
                                  <Video className="w-3.5 h-3.5 text-[#FF9494]" />
                                  {meeting.link}
                                </div>
                              </div>

                              <button className="w-full py-2 bg-gradient-to-r from-[#FF7B7B] to-[#FF9494] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                Join Meeting
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
