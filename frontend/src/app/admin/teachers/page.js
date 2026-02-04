"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";
import { Modal, ConfirmModal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const departmentOptions = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Science", label: "Science" },
  { value: "English", label: "English" },
  { value: "Social Studies", label: "Social Studies" },
  { value: "Physical Education", label: "Physical Education" },
  { value: "Arts", label: "Arts" },
  { value: "Technology", label: "Technology" },
  { value: "Languages", label: "Languages" },
];

function TeachersPage() {
  const { showSuccess, showError } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    subjects: "",
    qualification: "",
    experience_years: 0,
    joining_date: "",
    address: "",
    bio: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllTeachers();
      
      if (response.success) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      showError("Error", "Failed to load teachers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedTeacher) {
        const response = await adminApi.updateTeacher(selectedTeacher.id, formData);
        if (response.success) {
          showSuccess("Success", "Teacher updated successfully!");
        }
      } else {
        const response = await adminApi.createTeacher(formData);
        if (response.success) {
          showSuccess("Success", "Teacher created successfully!");
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      showError("Error", error.message || "Failed to save teacher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.deleteTeacher(selectedTeacher.id);
      showSuccess("Success", "Teacher deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      showError("Error", error.message || "Failed to delete teacher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      subjects: "",
      qualification: "",
      experience_years: 0,
      joining_date: "",
      address: "",
      bio: "",
      is_active: true,
    });
    setSelectedTeacher(null);
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
      subjects: teacher.subjects_text,
      qualification: teacher.qualification || "",
      experience_years: teacher.experience_years,
      joining_date: teacher.joining_date,
      address: teacher.address || "",
      bio: teacher.bio || "",
      is_active: teacher.is_active,
    });
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter((t) =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
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
            placeholder="Search teachers..."
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
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Teacher</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subjects</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {teacher.first_name.charAt(0)}{teacher.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{teacher.full_name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{teacher.department}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{teacher.subjects_text}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        teacher.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedTeacher(teacher); setIsDeleteModalOpen(true); }}
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
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No teachers found</h3>
            <p className="text-muted-foreground">Add your first teacher to get started</p>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedTeacher ? "Edit Teacher" : "Add Teacher"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>{selectedTeacher ? "Update" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input label="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
          <Input label="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <Select label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} options={departmentOptions} required />
          <Input label="Subjects (comma separated)" value={formData.subjects} onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} required />
          <Input label="Qualification" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
          <Input label="Experience (years)" type="number" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })} />
          <Input label="Joining Date" type="date" value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} required />
          <Select label="Status" value={formData.is_active.toString()} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedTeacher(null); }}
        onConfirm={handleDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.full_name}?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default withAuth(TeachersPage);