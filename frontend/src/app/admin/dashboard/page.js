"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/Card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { withAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { formatDate } from "@/lib/utils";

function DashboardPage() {
  const { showError } = useToast();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      showError("Error", "Failed to load dashboard stats.");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats?.total_students || 0,
      icon: Users,
      color: "primary",
      href: "/admin/students",
    },
    {
      title: "Total Teachers",
      value: stats?.total_teachers || 0,
      icon: UserCheck,
      color: "secondary",
      href: "/admin/teachers",
    },
    {
      title: "Pending Registrations",
      value: stats?.pending_registrations || 0,
      icon: FileText,
      color: "warning",
      href: "/admin/registrations",
    },
    {
      title: "Learning Materials",
      value: stats?.total_materials || 0,
      icon: BookOpen,
      color: "success",
      href: "/admin/materials",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening in your school.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={card.href}>
                  <StatCard
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    color={card.color}
                  />
                </Link>
              </motion.div>
            ))}
      </div>

      {/* Recent Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Registrations</CardTitle>
            </div>
            <Link
              href="/admin/registrations"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats?.recent_registrations?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {registration.first_name.charAt(0)}
                          {registration.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {registration.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(registration.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending registrations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Add Student", href: "/admin/students", icon: Users, color: "bg-blue-500" },
            { label: "Add Teacher", href: "/admin/teachers", icon: UserCheck, color: "bg-green-500" },
            { label: "Add Material", href: "/admin/materials", icon: BookOpen, color: "bg-purple-500" },
            { label: "Add Schedule", href: "/admin/schedules", icon: Calendar, color: "bg-orange-500" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default withAuth(DashboardPage);