"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Pencil,
  Trash2,
  Mail,
  MoreVertical,
  X,
  Bell,
  Plus,
  Link,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  getHours,
  getMinutes,
  addMinutes,
} from "date-fns";
import axios from "axios";
import { useSession } from "next-auth/react";
import { BlobButton } from "../BlobButton";
import { CalendarEvent } from "@/types/models";
interface CalendarPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Controlled by WorkspaceLayout for keyboard shortcuts
  viewMode: "day" | "week";
  setViewMode: (v: "day" | "week") => void;
  baseDate: Date;
  setBaseDate: (d: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  viewMode,
  setViewMode,
  baseDate,
  setBaseDate,
}) => {
  const { data: session } = useSession();
  const calendarOwnerName = session?.user?.name || "Me";
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    summary: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const scrollPos = Math.max((currentHour - 1) * 60, 0);
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, []);

  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });

  const DAYS =
    viewMode === "week"
      ? Array.from({ length: 5 }).map((_, i) => {
          const d = addDays(weekStart, i);
          return {
            day: format(d, "EEE").toUpperCase(),
            date: format(d, "dd"),
            active: isSameDay(d, new Date()),
            fullDate: d,
          };
        })
      : [
          {
            day: format(baseDate, "EEE").toUpperCase(),
            date: format(baseDate, "dd"),
            active: isSameDay(baseDate, new Date()),
            fullDate: baseDate,
          },
        ];

  const currentMonthYear = format(
    viewMode === "week" ? weekStart : baseDate,
    "MMMM yyyy",
  );
  const ROW_HEIGHT = 60;

  const [isConnected, setIsConnected] = useState(false);

  const fetchEvents = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get("/api/calendar");
      setEvents(res.data.events || []);

      if (res.data.isConnected !== undefined) {
        setIsConnected(res.data.isConnected);
      } else if (res.data.events && res.data.events.length > 0) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
      return res.data;
    } catch (err) {
      console.error("Failed to fetch events", err);
      return null;
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const handleRestore = React.useCallback(async () => {
    setSyncing(true);
    try {
      await axios.post("/api/calendar/sync");
      await fetchEvents();
    } catch (err) {
      console.error("Failed to restore history", err);
    } finally {
      setSyncing(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    let isMounted = true;

    fetchEvents(false).then((data) => {
      if (!isMounted) return;
      const currentlyConnected = data?.isConnected ?? false;
      const currentEventsCount = data?.events?.length ?? 0;
      if (currentlyConnected && currentEventsCount === 0) {
        handleRestore();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchEvents, handleRestore]);

  const handlePrev = () =>
    setBaseDate(addDays(baseDate, viewMode === "week" ? -7 : -1));
  const handleNext = () =>
    setBaseDate(addDays(baseDate, viewMode === "week" ? 7 : 1));

  const handleConnectClick = () => {
    setIsConnecting(true);
    window.location.href = "/api/connect?plugin=googlecalendar";
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      showError("End time must be after the start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startIso = new Date(formData.startTime).toISOString();
      const endIso = new Date(formData.endTime).toISOString();
      await axios.post("/api/calendar/modify", {
        action: "create",
        ...formData,
        startTime: startIso,
        endTime: endIso,
      });
      setIsCreatingEvent(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent, id: string) => {
    e.preventDefault();

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      showError("End time must be after the start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startIso = new Date(formData.startTime).toISOString();
      const endIso = new Date(formData.endTime).toISOString();
      await axios.post("/api/calendar/modify", {
        action: "update",
        id,
        ...formData,
        startTime: startIso,
        endTime: endIso,
      });
      setEditingMeetingId(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to update event", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await axios.post("/api/calendar/modify", { action: "delete", id });
      setSelectedMeeting(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const timelineEvents = events
    .map((e: CalendarEvent) => {
      if (!e.startTime || !e.endTime) return null;
      const startD = parseISO(e.startTime);
      const endD = parseISO(e.endTime);

      const dayIndex = DAYS.findIndex((d) => isSameDay(d.fullDate, startD));
      if (dayIndex === -1) return null;

      const startHour = getHours(startD) + getMinutes(startD) / 60;
      const endHour = getHours(endD) + getMinutes(endD) / 60;

      if (startHour > 24 || endHour < 0) return null;

      let durationHours =
        (endD.getTime() - startD.getTime()) / (1000 * 60 * 60);
      if (durationHours < 0) {
        durationHours += 24; // Crosses midnight
      }

      return {
        ...e,
        dayIndex,
        startHour,
        durationHours,
      };
    })
    .filter(Boolean) as (CalendarEvent & {
    dayIndex: number;
    startHour: number;
    durationHours: number;
  })[];

  const formatEventDate = (start: string, end: string) => {
    const s = parseISO(start);
    const e = parseISO(end);
    return `${format(s, "EEEE, d MMMM")} • ${format(s, "h:mm")} – ${format(e, "h:mma").toLowerCase()}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      <div className="p-4 flex flex-col gap-4 border-b border-white/20 dark:border-white/5 shrink-0">
        <div className="flex justify-between items-center h-8">
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
          >
            {isCollapsed ? "←" : "→"}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <BlobButton
                size="sm"
                onClick={() => {
                  setFormData({
                    summary: "",
                    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(
                      addMinutes(new Date(), 30),
                      "yyyy-MM-dd'T'HH:mm",
                    ),
                  });
                  setIsCreatingEvent(true);
                }}
                className="flex items-center gap-1 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Create
              </BlobButton>
              <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === "day" ? "bg-white dark:bg-[#23232A] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === "week" ? "bg-white dark:bg-[#23232A] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  Week
                </button>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex justify-between items-center px-1">
            <span className="font-heading font-bold text-lg tracking-tight">
              {currentMonthYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {isCollapsed ? (
          <div className="w-full py-4 flex flex-col items-center gap-4 border-l border-white/20 dark:border-white/5 overflow-y-auto">
            <button
              onClick={onToggleCollapse}
              title="Open Calendar"
              className="w-10 h-10 rounded-xl bg-[#FFE3E1] dark:bg-[#FF9494]/20 text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors flex items-center justify-center shadow-sm"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                onToggleCollapse();
                setTimeout(() => {
                  setFormData({
                    summary: "",
                    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(
                      addMinutes(new Date(), 30),
                      "yyyy-MM-dd'T'HH:mm",
                    ),
                  });
                  setIsCreatingEvent(true);
                }, 400);
              }}
              title="Create Event"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7B7B] to-[#FF9494] text-white hover:shadow-lg transition-all flex items-center justify-center shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="w-full border-t border-white/20 dark:border-white/5 my-1" />
            <div className="flex flex-col gap-2 w-full px-2">
              {timelineEvents.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onToggleCollapse();
                    setTimeout(() => {
                      setBaseDate(parseISO(m.startTime));
                      setViewMode("day");
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = Math.max(
                          (m.startHour - 1) * 60,
                          0,
                        );
                      }
                    }, 400);
                  }}
                  className="w-full py-2 px-1 rounded-lg bg-white/40 dark:bg-white/5 border border-[#FF9494]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 hover:border-[#FF9494] transition-all"
                  title={m.summary}
                >
                  <span className="text-[10px] font-bold text-[#FF9494] tracking-tight">
                    {format(parseISO(m.startTime), "h:mm")}
                  </span>
                  <span className="text-[8px] font-semibold text-gray-400 uppercase">
                    {format(parseISO(m.startTime), "a")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {events.length === 0 && !isLoading ? (
              !isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-center mt-12 mb-12">
                  <div className="w-20 h-20 bg-gradient-to-tr from-[#FFE3E1] to-[#FF9494] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#FF9494]/20">
                    <CalendarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                    Connect Your Calendar
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                    Initialize your neural core to automatically triage,
                    categorize, and organize your schedules.
                  </p>
                  <BlobButton
                    onClick={handleConnectClick}
                    disabled={isConnecting}
                    className="w-[250px]"
                  >
                    {isConnecting
                      ? "Initializing Neural Synchronization..."
                      : "Connect Calendar"}
                  </BlobButton>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-center mt-12 mb-12">
                  {syncing ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#FF9494] border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Syncing Calendar Data...
                      </h3>
                      <p className="text-sm text-gray-500">
                        Please wait while we securely fetch your events from
                        Google.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon className="w-12 h-12 mb-4 opacity-50 text-gray-500 mx-auto" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No events found
                      </h3>
                      <p className="text-sm text-gray-500">
                        There are no upcoming events in your calendar.
                      </p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                <div className="flex border-b border-white/20 dark:border-white/5 shrink-0 pl-14">
                  {DAYS.map((day, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setBaseDate(day.fullDate);
                        setViewMode("day");
                      }}
                      className="flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span
                        className={`text-[10px] font-bold tracking-widest ${day.active ? "text-[#FF9494]" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {day.day}
                      </span>
                      <span
                        className={`text-lg font-heading font-bold ${day.active ? "text-[#2D2A26] dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                      >
                        {day.date}
                      </span>
                      {day.active && (
                        <div className="w-1 h-1 rounded-full bg-[#FF9494] mt-1" />
                      )}
                    </div>
                  ))}
                </div>

                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto relative pb-20 scroll-smooth"
                >
                  <div
                    className="flex relative min-w-[500px]"
                    style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}
                  >
                    <div className="w-14 flex flex-col border-r border-white/20 dark:border-white/5 bg-transparent sticky left-0 z-10">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="w-full flex justify-center items-start text-[10px] font-semibold text-gray-400 dark:text-gray-500 pr-2 -mt-1.5"
                          style={{ height: ROW_HEIGHT }}
                        >
                          {hour === 0
                            ? "12 AM"
                            : hour < 12
                              ? `${hour} AM`
                              : hour === 12
                                ? "12 PM"
                                : `${hour - 12} PM`}
                        </div>
                      ))}
                    </div>

                    <div className="flex-1 relative">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="w-full border-t border-white/20 dark:border-white/5"
                          style={{ height: ROW_HEIGHT }}
                        />
                      ))}

                      <div
                        className="absolute w-full flex items-center pointer-events-none z-0"
                        style={{
                          top: `${(new Date().getHours() + new Date().getMinutes() / 60) * ROW_HEIGHT}px`,
                        }}
                        suppressHydrationWarning
                      >
                        <div
                          className="w-2 h-2 rounded-full bg-[#FF9494] -ml-1 shadow-[0_0_8px_rgba(255,148,148,0.8)]"
                          suppressHydrationWarning
                        />
                        <div
                          className="h-[1px] w-full bg-[#FF9494] shadow-[0_0_5px_rgba(255,148,148,0.5)]"
                          suppressHydrationWarning
                        />
                      </div>

                      {timelineEvents.map((meeting) => {
                        const topPos = meeting.startHour * ROW_HEIGHT;
                        const isShortEvent = meeting.durationHours <= 0.5;
                        const heightPos = isShortEvent
                          ? 24
                          : meeting.durationHours * ROW_HEIGHT;
                        const leftPos = (meeting.dayIndex / DAYS.length) * 100;
                        const widthPos = 100 / DAYS.length;

                        const isSelected = selectedMeeting === meeting.id;
                        const isEditing = editingMeetingId === meeting.id;

                        return (
                          <div
                            key={meeting.id}
                            className="absolute p-[1px]"
                            style={{
                              top: `${Math.max(topPos, 0)}px`,
                              height: `${heightPos}px`,
                              left: `${leftPos}%`,
                              width: `${widthPos}%`,
                              zIndex: isSelected ? 30 : 10,
                            }}
                          >
                            <motion.div
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedMeeting(null);
                                  setEditingMeetingId(null);
                                } else {
                                  setSelectedMeeting(meeting.id);
                                }
                              }}
                              whileHover={{ scale: 1.02, zIndex: 20 }}
                              className={
                                isShortEvent
                                  ? `relative w-full h-full rounded-full flex items-center px-1.5 cursor-pointer overflow-hidden transition-all shadow-sm border
                                      ${isSelected ? "bg-white dark:bg-[#2A2D35] ring-2 ring-[#FF9494] border-transparent" : "bg-white dark:bg-[#1A1D23] hover:bg-gray-50 dark:hover:bg-[#23232A] border-gray-200 dark:border-white/10"}`
                                  : `relative w-full h-full rounded-[4px] cursor-pointer overflow-hidden transition-colors flex flex-col p-1.5
                                      ${isSelected ? "bg-[#FF9494] shadow-md ring-1 ring-black/10 dark:ring-white/20" : "bg-[#FF9494]/90 hover:bg-[#FF9494] border border-[#FF9494]/20"}`
                              }
                            >
                              {isShortEvent ? (
                                <>
                                  <div className="w-2.5 h-2.5 rounded-full border-[2px] border-[#FF9494] mr-1.5 shrink-0" />
                                  <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 mr-1">
                                    {meeting.summary || "Busy"},
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {format(
                                      parseISO(meeting.startTime),
                                      "h:mma",
                                    ).toLowerCase()}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight mb-0.5">
                                    {meeting.summary || "Busy"}
                                  </span>
                                  <span className="text-[9px] font-medium text-white/90 leading-none">
                                    {format(
                                      parseISO(meeting.startTime),
                                      "h:mm",
                                    )}{" "}
                                    –{" "}
                                    {format(
                                      parseISO(meeting.endTime),
                                      "h:mma",
                                    ).toLowerCase()}
                                  </span>
                                </>
                              )}
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EVENT DETAILS MODAL */}
            <AnimatePresence>
              {selectedMeeting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  {(() => {
                    const meeting = events.find(
                      (e) => e.id === selectedMeeting,
                    );
                    if (!meeting) return null;
                    const isEditing = editingMeetingId === meeting.id;

                    return (
                      <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="w-[380px] bg-[#FFF5E4] dark:bg-[#1A1D23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-0 pointer-events-auto overflow-hidden"
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleUpdateEvent(e, meeting.id)}
                            className="p-4 flex flex-col gap-3"
                          >
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              Edit Event
                            </h4>
                            <input
                              type="text"
                              value={formData.summary}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  summary: e.target.value,
                                })
                              }
                              className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                              placeholder="Event Title"
                              required
                            />
                            <div className="flex gap-2">
                              <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    startTime: e.target.value,
                                  })
                                }
                                className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                                required
                              />
                              <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    endTime: e.target.value,
                                  })
                                }
                                className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                                required
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => setEditingMeetingId(null)}
                                className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                              >
                                Cancel
                              </button>
                              <BlobButton
                                type="submit"
                                className="flex-1"
                                size="sm"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Updating..." : "Save Changes"}
                              </BlobButton>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex justify-end items-center gap-1 p-2 bg-[#FFF5E4] dark:bg-[#23232A] border-b border-gray-200 dark:border-white/10">
                              <button
                                onClick={() => {
                                  setFormData({
                                    summary: meeting.summary,
                                    startTime: format(
                                      new Date(meeting.startTime),
                                      "yyyy-MM-dd'T'HH:mm",
                                    ),
                                    endTime: format(
                                      new Date(meeting.endTime),
                                      "yyyy-MM-dd'T'HH:mm",
                                    ),
                                  });
                                  setEditingMeetingId(meeting.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors"
                                title="Edit Event"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(meeting.id)}
                                className="p-1.5 rounded-full hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMeeting(null);
                                  setEditingMeetingId(null);
                                }}
                                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors ml-2"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="p-6 flex items-start gap-4">
                              <div className="w-4 h-4 mt-1.5 rounded bg-[#FF9494] shadow-[0_0_8px_rgba(255,148,148,0.6)] shrink-0" />

                              <div className="flex flex-col">
                                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white leading-tight mb-1">
                                  {meeting.summary}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                                  {formatEventDate(
                                    meeting.startTime,
                                    meeting.endTime,
                                  )}
                                </p>

                                <div className="mb-6">
                                  <a
                                    href={meeting.htmlLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF9494]/30 text-[#FF9494] text-xs font-bold hover:bg-[#FF9494]/10 transition-colors"
                                  >
                                    <Link className="w-3.5 h-3.5" /> Invite via
                                    link
                                  </a>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  <Bell className="w-4 h-4" />
                                  <span>15 minutes before</span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{calendarOwnerName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CREATE EVENT MODAL */}
            <AnimatePresence>
              {isCreatingEvent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-[#FFF5E4] dark:bg-[#1A1D23] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-[#FFF5E4] dark:bg-[#23232A]">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#FF9494]" />{" "}
                        Create Event
                      </h3>
                      <button
                        onClick={() => setIsCreatingEvent(false)}
                        className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleCreateEvent}
                      className="p-6 flex flex-col gap-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                          Event Title
                        </label>
                        <input
                          type="text"
                          value={formData.summary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              summary: e.target.value,
                            })
                          }
                          className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                          placeholder="e.g. Hackathon Check-in"
                          required
                        />
                      </div>
                      <div className="flex gap-1 ">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Start Time
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-2 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                            required
                          />
                        </div>
                        <div className="flex-1 ">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            End Time
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-2 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9494]"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <BlobButton
                          type="submit"
                          className="w-full"
                          size="md"
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Establishing Event..."
                            : "Create Event"}
                        </BlobButton>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
