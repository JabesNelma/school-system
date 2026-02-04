"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal, ConfirmModal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function RegistrationsPage() {
  const { showSuccess, showError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, [filter]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getRegistrations({ status: filter });
      
      if (response.success) {
        setRegistrations(response.data.registrations);
      }
    } catch (error) {
      showError("Error", "Failed to load registrations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRegistration) return;
    
    setIsProcessing(true);
    try {
      const response = await adminApi.approveRegistration(selectedRegistration.id);
      
      if (response.success) {
        showSuccess("Success", "Registration approved successfully!");
        setIsApproveModalOpen(false);
        setSelectedRegistration(null);
        fetchRegistrations();
      }
    } catch (error) {
      showError("Error", error.message || "Failed to approve registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration) return;
    
    setIsProcessing(true);
    try {
      const response = await adminApi.rejectRegistration(selectedRegistration.id);
      
      if (response.success) {
        showSuccess("Success", "Registration rejected.");
        setIsRejectModalOpen(false);
        setSelectedRegistration(null);
        fetchRegistrations();
      }
    } catch (error) {
      showError("Error", error.message || "Failed to reject registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[status] || styles.pending
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
          <h1 className="text-2xl font-bold text-foreground">Student Registrations</h1>
          <p className="text-muted-foreground">
            Manage student registration applications
          </p>
        </div>
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
            placeholder="Search registrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
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
        ) : filteredRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {registration.first_name.charAt(0)}
                            {registration.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{registration.full_name}</p>
                          <p className="text-sm text-muted-foreground">{registration.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {registration.grade_applying}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(registration.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(registration.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {registration.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setIsApproveModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No registrations found
            </h3>
            <p className="text-muted-foreground">
              {filter === "pending"
                ? "No pending registrations at the moment"
                : `No ${filter} registrations found`}
            </p>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRegistration(null);
        }}
        title="Registration Details"
        size="lg"
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Student Name</h4>
                <p className="text-foreground">{selectedRegistration.full_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                <p className="text-foreground">{selectedRegistration.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                <p className="text-foreground">{selectedRegistration.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h4>
                <p className="text-foreground">{formatDate(selectedRegistration.date_of_birth)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Gender</h4>
                <p className="text-foreground capitalize">{selectedRegistration.gender}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Grade Applying</h4>
                <p className="text-foreground">{selectedRegistration.grade_applying}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                <p className="text-foreground">{selectedRegistration.address}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Parent Name</h4>
                <p className="text-foreground">{selectedRegistration.parent_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Parent Phone</h4>
                <p className="text-foreground">{selectedRegistration.parent_phone}</p>
              </div>
              {selectedRegistration.previous_school && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Previous School</h4>
                  <p className="text-foreground">{selectedRegistration.previous_school}</p>
                </div>
              )}
              {selectedRegistration.medical_notes && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Medical Notes</h4>
                  <p className="text-foreground">{selectedRegistration.medical_notes}</p>
                </div>
              )}
            </div>
            
            {selectedRegistration.status === "pending" && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsRejectModalOpen(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsApproveModalOpen(true);
                  }}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Confirm Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedRegistration(null);
        }}
        onConfirm={handleApprove}
        title="Approve Registration"
        description={`Are you sure you want to approve the registration for ${selectedRegistration?.full_name}? This will create a student record.`}
        confirmText="Approve"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Reject Confirm Modal */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRegistration(null);
        }}
        onConfirm={handleReject}
        title="Reject Registration"
        description={`Are you sure you want to reject the registration for ${selectedRegistration?.full_name}?`}
        confirmText="Reject"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}

export default withAuth(RegistrationsPage);