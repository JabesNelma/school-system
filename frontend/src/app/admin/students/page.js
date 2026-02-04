"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";
import { Modal, ConfirmModal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const gradeOptions = [
  { value: "Grade 1", label: "Grade 1" },
  { value: "Grade 2", label: "Grade 2" },
  { value: "Grade 3", label: "Grade 3" },
  { value: "Grade 4", label: "Grade 4" },
  { value: "Grade 5", label: "Grade 5" },
  { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" },
  { value: "Grade 8", label: "Grade 8" },
  { value: "Grade 9", label: "Grade 9" },
  { value: "Grade 10", label: "Grade 10" },
  { value: "Grade 11", label: "Grade 11" },
  { value: "Grade 12", label: "Grade 12" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "transferred", label: "Transferred" },
];

function StudentsPage() {
  const { showSuccess, showError } = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    grade_level: "",
    section: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_notes: "",
    status: "active",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (gradeFilter) params.grade = gradeFilter;
      if (search) params.search = search;
      
      const response = await adminApi.getStudents(params);
      
      if (response.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      showError("Error", "Failed to load students.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedStudent) {
        const response = await adminApi.updateStudent(selectedStudent.id, formData);
        if (response.success) {
          showSuccess("Success", "Student updated successfully!");
        }
      } else {
        const response = await adminApi.createStudent(formData);
        if (response.success) {
          showSuccess("Success", "Student created successfully!");
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      showError("Error", error.message || "Failed to save student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.deleteStudent(selectedStudent.id);
      showSuccess("Success", "Student deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      showError("Error", error.message || "Failed to delete student.");
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
      date_of_birth: "",
      gender: "",
      address: "",
      grade_level: "",
      section: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
      emergency_contact: "",
      emergency_phone: "",
      medical_notes: "",
      status: "active",
    });
    setSelectedStudent(null);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone || "",
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      address: student.address || "",
      grade_level: student.grade_level,
      section: student.section || "",
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      parent_email: student.parent_email || "",
      emergency_contact: student.emergency_contact,
      emergency_phone: student.emergency_phone,
      medical_notes: student.medical_notes || "",
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const statusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
      transferred: "bg-orange-100 text-orange-800",
    };
    
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[status] || styles.active
      )}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage enrolled students</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          placeholder="All Grades"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          options={gradeOptions}
          className="w-40"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {isLoading ? (
          <TableSkeleton />
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.student_id}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.grade_level}</td>
                    <td className="px-4 py-3">{statusBadge(student.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                          title="Delete"
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
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground">Add your first student to get started</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedStudent ? "Edit Student" : "Add Student"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {selectedStudent ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            required
          />
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            required
          />
          <Select
            label="Grade Level"
            value={formData.grade_level}
            onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
            options={gradeOptions}
            required
          />
          <Input
            label="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          />
          <Input
            label="Parent Name"
            value={formData.parent_name}
            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
            required
          />
          <Input
            label="Parent Phone"
            value={formData.parent_phone}
            onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
            required
          />
          <Input
            label="Parent Email"
            type="email"
            value={formData.parent_email}
            onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedStudent(null); }}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${selectedStudent?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default withAuth(StudentsPage);