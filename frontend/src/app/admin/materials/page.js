"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/Button";
import { Input, Select, Textarea } from "@/components/Input";
import { Modal, ConfirmModal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";

const typeOptions = [
  { value: "document", label: "Document" },
  { value: "video", label: "Video" },
  { value: "link", label: "Link" },
  { value: "book", label: "Book" },
  { value: "audio", label: "Audio" },
  { value: "image", label: "Image" },
];

function MaterialsPage() {
  const { showSuccess, showError } = useToast();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    grade_level: "",
    material_type: "",
    file_url: "",
    external_link: "",
    author: "",
    publisher: "",
    is_public: true,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllMaterials();
      
      if (response.success) {
        setMaterials(response.data.materials);
      }
    } catch (error) {
      showError("Error", "Failed to load materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedMaterial) {
        const response = await adminApi.updateMaterial(selectedMaterial.id, formData);
        if (response.success) {
          showSuccess("Success", "Material updated successfully!");
        }
      } else {
        const response = await adminApi.createMaterial(formData);
        if (response.success) {
          showSuccess("Success", "Material created successfully!");
        }
      }
      setIsModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      showError("Error", error.message || "Failed to save material.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.deleteMaterial(selectedMaterial.id);
      showSuccess("Success", "Material deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (error) {
      showError("Error", error.message || "Failed to delete material.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      grade_level: "",
      material_type: "",
      file_url: "",
      external_link: "",
      author: "",
      publisher: "",
      is_public: true,
    });
    setSelectedMaterial(null);
  };

  const openEditModal = (material) => {
    setSelectedMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || "",
      subject: material.subject,
      grade_level: material.grade_level,
      material_type: material.material_type,
      file_url: material.file_url || "",
      external_link: material.external_link || "",
      author: material.author || "",
      publisher: material.publisher || "",
      is_public: material.is_public,
    });
    setIsModalOpen(true);
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcons = {
    document: "📄",
    video: "🎥",
    link: "🔗",
    book: "📚",
    audio: "🎧",
    image: "🖼️",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials</h1>
          <p className="text-muted-foreground">Manage learning materials and resources</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
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
            placeholder="Search materials..."
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
        ) : filteredMaterials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Material</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Visibility</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeIcons[material.material_type] || "📄"}</span>
                        <div>
                          <p className="font-medium text-foreground">{material.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">{material.material_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{material.subject}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{material.grade_level}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        material.is_public ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {material.is_public ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(material.file_url || material.external_link) && (
                          <a
                            href={material.external_link || material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(material)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedMaterial(material); setIsDeleteModalOpen(true); }}
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
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No materials found</h3>
            <p className="text-muted-foreground">Add your first material to get started</p>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedMaterial ? "Edit Material" : "Add Material"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>{selectedMaterial ? "Update" : "Create"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Select label="Material Type" value={formData.material_type} onChange={(e) => setFormData({ ...formData, material_type: e.target.value })} options={typeOptions} required />
          <Input label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
          <Input label="Grade Level" value={formData.grade_level} onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })} required />
          <Input label="File URL" value={formData.file_url} onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} />
          <Input label="External Link" value={formData.external_link} onChange={(e) => setFormData({ ...formData, external_link: e.target.value })} />
          <Input label="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          <Input label="Publisher" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
          <Select label="Visibility" value={formData.is_public.toString()} onChange={(e) => setFormData({ ...formData, is_public: e.target.value === "true" })} options={[{ value: "true", label: "Public" }, { value: "false", label: "Private" }]} />
          <div className="md:col-span-2">
            <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedMaterial(null); }}
        onConfirm={handleDelete}
        title="Delete Material"
        description={`Are you sure you want to delete "${selectedMaterial?.title}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default withAuth(MaterialsPage);