"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MaterialCard } from "@/components/Card";
import { Input, Select } from "@/components/Input";
import { CardSkeleton } from "@/components/Skeleton";
import { publicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { cn, debounce } from "@/lib/utils";

export default function MaterialsPage() {
  const { showError } = useToast();
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    subjects: [],
    grade_levels: [],
    types: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    search: "",
    subject: "",
    grade_level: "",
    type: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        per_page: 12,
        ...(selectedFilters.subject && { subject: selectedFilters.subject }),
        ...(selectedFilters.grade_level && { grade_level: selectedFilters.grade_level }),
        ...(selectedFilters.type && { type: selectedFilters.type }),
        ...(selectedFilters.search && { search: selectedFilters.search }),
      };
      
      const response = await publicApi.getMaterials(params);
      
      if (response.success) {
        setMaterials(response.data.materials);
        setPagination({
          page: response.data.current_page,
          pages: response.data.pages,
          total: response.data.total,
        });
      }
    } catch (error) {
      showError("Error", "Failed to load materials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilters = async () => {
    try {
      const response = await publicApi.getMaterialFilters();
      if (response.success) {
        setFilters({
          subjects: response.data.subjects.map((s) => ({ value: s, label: s })),
          grade_levels: response.data.grade_levels.map((g) => ({ value: g, label: g })),
          types: response.data.types.map((t) => ({ value: t, label: t })),
        });
      }
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFilters();
    fetchMaterials();
  }, []);

  // Debounced search
  const debouncedSearch = debounce(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchMaterials();
  }, 300);

  useEffect(() => {
    debouncedSearch();
  }, [selectedFilters]);

  const handleSearchChange = (e) => {
    setSelectedFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

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
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Learning Materials</h1>
                <p className="text-muted-foreground">
                  Access study resources, documents, and educational content
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  value={selectedFilters.search}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select
                placeholder="All Subjects"
                value={selectedFilters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
                options={filters.subjects}
              />
              <Select
                placeholder="All Grades"
                value={selectedFilters.grade_level}
                onChange={(e) => handleFilterChange("grade_level", e.target.value)}
                options={filters.grade_levels}
              />
              <Select
                placeholder="All Types"
                value={selectedFilters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                options={filters.types}
              />
            </div>
          </motion.div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {materials.length} of {pagination.total} materials
            </p>
          </div>

          {/* Materials Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : materials.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {materials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MaterialCard material={material} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No materials found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPagination((prev) => ({ ...prev, page: i + 1 }));
                    fetchMaterials();
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pagination.page === i + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}