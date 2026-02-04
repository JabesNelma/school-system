"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ 
  children, 
  className, 
  hover = true,
  onClick,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.15)" } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "bg-card text-card-foreground rounded-xl border border-border",
        "overflow-hidden",
        hover && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("p-6 pb-0", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn("p-6 pt-0 flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

// Stat Card for dashboard
export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendUp,
  color = "primary" 
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    danger: "bg-red-500/10 text-red-500",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    trendUp ? "text-green-500" : "text-red-500"
                  )}
                >
                  {trendUp ? "+" : ""}{trend}
                </span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-lg", colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Teacher Card
export function TeacherCard({ teacher }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {teacher.profile_image ? (
              <img
                src={teacher.profile_image}
                alt={teacher.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-primary">
                {teacher.first_name.charAt(0)}{teacher.last_name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {teacher.full_name}
            </h3>
            <p className="text-sm text-primary">{teacher.department}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {teacher.subjects_text}
            </p>
            {teacher.qualification && (
              <p className="text-xs text-muted-foreground mt-2">
                {teacher.qualification}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Material Card
export function MaterialCard({ material }) {
  const typeIcons = {
    document: "📄",
    video: "🎥",
    link: "🔗",
    book: "📚",
    audio: "🎧",
    image: "🖼️",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{typeIcons[material.material_type] || "📄"}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {material.title}
            </h3>
            <p className="text-sm text-primary">{material.subject}</p>
          </div>
        </div>
        
        {material.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {material.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Grade: {material.grade_level}</span>
          {material.file_size && <span>{material.file_size}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// Schedule Card
export function ScheduleCard({ schedule }) {
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn("w-2 h-12 rounded-full", dayColors[schedule.day_of_week] || "bg-gray-500")} />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{schedule.title}</h3>
            <p className="text-sm text-primary">{schedule.subject}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{schedule.start_time} - {schedule.end_time}</span>
              {schedule.room && <span>Room: {schedule.room}</span>}
            </div>
            {schedule.teacher_name && (
              <p className="text-sm text-muted-foreground mt-1">
                Teacher: {schedule.teacher_name}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {schedule.day_of_week}
            </span>
            {schedule.grade_level && (
              <p className="text-xs text-muted-foreground mt-1">{schedule.grade_level}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Card Skeleton for loading
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          <div className="h-8 bg-muted rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded w-40 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}