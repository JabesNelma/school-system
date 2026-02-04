"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Search, Edit2, Trash2, Clock } from "lucide-react";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi, publicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";
import { Modal, ConfirmModal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";

const dayOptions = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

function SchedulesPage() {
  const { showSuccess, showError } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade_level: "",
    section: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    room: "",
    teacher_id: "",
    description: "",
    effective_from: "",
  });

  useEffect(() => {
    fetchSchedules();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllSchedules();
      
      if (response.success) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      showError("Error", "Failed to load schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await publicApi.getTeachers({ per_page: 100 });
      if (response.success) {
        setTeachers(response.data.teachers.map((t) => ({ value: t.id.toString(), label: t.full_name })));
      }
    } catch (error) {
      console.error("Failed to load teachers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedSchedule) {
        const response = await adminApi.updateSchedule(selectedSchedule.id, formData);
        if (response.success) {
          showSuccess("Success", "Schedule updated successfully!");
        }
      } else {
        const response = await adminApi.createSchedule(formData);
        if (response.success) {
          showSuccess("Success", "Schedule created successfully!");
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      showError("Error", error.message || "Failed to save schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.deleteSchedule(selectedSchedule.id);
      showSuccess("Success", "Schedule deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      showError("Error", error.message || "Failed to delete schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      grade_level: "",
      section: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      room: "",
      teacher_id: "",
      description: "",
      effective_from: "",
    });
    setSelectedSchedule(null);
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title,
      subject: schedule.subject,
      grade_level: schedule.grade_level,
      section: schedule.section || "",
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room || "",
      teacher_id: schedule.teacher_id?.toString() || "",
      description: schedule.description || "",
      effective_from: schedule.effective_from,
    });
    setIsModalOpen(true);
  };

  const filteredSchedules = schedules.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  const dayColors = {
    Monday: "bg-blue-500",
    Tuesday: "bg-green-500",
    Wednesday: "bg-yellow-500",
    Thursday: "bg-purple-500",
    Friday: "bg-pink-500",
    Saturday: "bg-orange-500",
    Sunday: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedules</h1>
          <p className="text-muted-foreground">Manage class timetables and schedules</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schedules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {isLoading ? (
          <TableSkeleton />
        ) : filteredSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Room</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-10 rounded-full", dayColors[schedule.day_of_week] || "bg-gray-500")} />
                        <div>
                          <p className="font-medium text-foreground">{schedule.title}</p>
                          <p className="text-sm text-muted-foreground">{schedule.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{schedule.day_of_week}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{schedule.room || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedSchedule(schedule); setIsDeleteModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No schedules found</h3>
            <p className="text-muted-foreground">Add your first schedule to get started</p>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedSchedule ? "Edit Schedule" : "Add Schedule"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>{selectedSchedule ? "Update" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Input label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
          <Input label="Grade Level" value={formData.grade_level} onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })} required />
          <Input label="Section" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
          <Select label="Day of Week" value={formData.day_of_week} onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })} options={dayOptions} required />
          <Input label="Start Time" type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
          <Input label="End Time" type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
          <Input label="Room" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} />
          <Select label="Teacher" value={formData.teacher_id} onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })} options={teachers} />
          <Input label="Effective From" type="date" value={formData.effective_from} onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })} required />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedSchedule(null); }}
        onConfirm={handleDelete}
        title="Delete Schedule"
        description={`Are you sure you want to delete "${selectedSchedule?.title}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default withAuth(SchedulesPage);