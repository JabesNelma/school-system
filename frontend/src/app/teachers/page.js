"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TeacherCard } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Input";
import { CardSkeleton } from "@/components/Skeleton";
import { publicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { cn, debounce } from "@/lib/utils";

export default function TeachersPage() {
  const { showError } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        per_page: 12,
        ...(filters.department && { department: filters.department }),
        ...(filters.search && { search: filters.search }),
      };
      
      const response = await publicApi.getTeachers(params);
      
      if (response.success) {
        setTeachers(response.data.teachers);
        setPagination({
          page: response.data.current_page,
          pages: response.data.pages,
          total: response.data.total,
        });
      }
    } catch (error) {
      showError("Error", "Failed to load teachers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await publicApi.getDepartments();
      if (response.success) {
        setDepartments(response.data.map((d) => ({ value: d, label: d })));
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  // Debounced search
  const debouncedSearch = debounce(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTeachers();
  }, 300);

  useEffect(() => {
    debouncedSearch();
  }, [filters.search, filters.department]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleDepartmentChange = (e) => {
    setFilters((prev) => ({ ...prev, department: e.target.value }));
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Our Teachers</h1>
                <p className="text-muted-foreground">
                  Meet our qualified and experienced educators
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers by name or subject..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <div className="sm:w-48">
                <Select
                  placeholder="All Departments"
                  value={filters.department}
                  onChange={handleDepartmentChange}
                  options={departments}
                />
              </div>
            </div>
          </motion.div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {teachers.length} of {pagination.total} teachers
            </p>
          </div>

          {/* Teachers Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : teachers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {teachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TeacherCard teacher={teacher} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No teachers found
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
                    fetchTeachers();
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