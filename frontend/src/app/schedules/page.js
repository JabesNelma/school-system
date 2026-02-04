"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScheduleCard } from "@/components/Card";
import { Select } from "@/components/Input";
import { CardSkeleton } from "@/components/Skeleton";
import { publicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function SchedulesPage() {
  const { showError } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [filters, setFilters] = useState({
    grade_levels: [],
    sections: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    grade_level: "",
    section: "",
    day: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("");

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const params = {
        per_page: 100,
        ...(selectedFilters.grade_level && { grade_level: selectedFilters.grade_level }),
        ...(selectedFilters.section && { section: selectedFilters.section }),
        ...(selectedFilters.day && { day: selectedFilters.day }),
      };
      
      const response = await publicApi.getSchedules(params);
      
      if (response.success) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      showError("Error", "Failed to load schedules. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilters = async () => {
    try {
      const response = await publicApi.getScheduleFilters();
      if (response.success) {
        setFilters({
          grade_levels: response.data.grade_levels.map((g) => ({ value: g, label: g })),
          sections: response.data.sections.map((s) => ({ value: s, label: s })),
        });
      }
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFilters();
    fetchSchedules();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedFilters]);

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Group schedules by day
  const schedulesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day_of_week === day);
    return acc;
  }, {});

  // Filter days that have schedules
  const daysWithSchedules = daysOfWeek.filter(
    (day) => schedulesByDay[day]?.length > 0
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Class Schedules</h1>
                <p className="text-muted-foreground">
                  View weekly class timetables and schedules
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                placeholder="All Grade Levels"
                value={selectedFilters.grade_level}
                onChange={(e) => handleFilterChange("grade_level", e.target.value)}
                options={filters.grade_levels}
              />
              <Select
                placeholder="All Sections"
                value={selectedFilters.section}
                onChange={(e) => handleFilterChange("section", e.target.value)}
                options={filters.sections}
              />
              <Select
                placeholder="All Days"
                value={selectedFilters.day}
                onChange={(e) => handleFilterChange("day", e.target.value)}
                options={daysOfWeek.map((d) => ({ value: d, label: d }))}
              />
            </div>
          </motion.div>

          {/* Day Tabs (Mobile) */}
          {daysWithSchedules.length > 0 && (
            <div className="lg:hidden mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveDay("")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    activeDay === ""
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  All Days
                </button>
                {daysWithSchedules.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                      activeDay === day
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schedules by Day */}
          {isLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <CardSkeleton />
                </div>
              ))}
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-8">
              {daysOfWeek.map((day) => {
                const daySchedules = schedulesByDay[day];
                const isVisible = !activeDay || activeDay === day;
                
                if (daySchedules.length === 0 || !isVisible) return null;
                
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-foreground">{day}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {daySchedules.length} classes
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {daySchedules.map((schedule, index) => (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ScheduleCard schedule={schedule} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No schedules found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}