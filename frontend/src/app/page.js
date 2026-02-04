"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "Expert Teachers",
    description: "Learn from qualified and experienced educators dedicated to student success.",
  },
  {
    icon: BookOpen,
    title: "Quality Education",
    description: "Comprehensive curriculum designed to prepare students for future challenges.",
  },
  {
    icon: Calendar,
    title: "Structured Learning",
    description: "Well-organized schedules and learning materials for effective education.",
  },
];

const stats = [
  { value: "500+", label: "Students Enrolled" },
  { value: "50+", label: "Expert Teachers" },
  { value: "20+", label: "Years of Excellence" },
  { value: "95%", label: "Success Rate" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="py-20 lg:py-32">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Hero Content */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <GraduationCap className="h-4 w-4" />
                    <span>Welcome to Our School</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Empowering Education for a{" "}
                    <span className="text-primary">Brighter Future</span>
                  </h1>
                  
                  <p className="text-lg text-muted-foreground max-w-xl">
                    Join our comprehensive school information system. Access learning materials, 
                    view schedules, connect with teachers, and start your educational journey today.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link href="/register">
                      <Button size="lg" className="gap-2">
                        Register Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/teachers">
                      <Button variant="outline" size="lg">
                        Meet Our Teachers
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Quick benefits */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {["Quality Education", "Expert Faculty", "Modern Facilities"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Hero Image/Illustration */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="relative hidden lg:block"
                >
                  <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/50 rounded-full blur-3xl" />
                    
                    {/* Main content card */}
                    <div className="relative bg-card rounded-2xl shadow-xl border border-border p-8">
                      <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="text-center p-4 rounded-xl bg-muted"
                          >
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-sm text-center text-muted-foreground">
                          &ldquo;Education is the passport to the future, for tomorrow belongs to those who prepare for it today.&rdquo;
                        </p>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          — Malcolm X
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground">Why Choose Us</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                We provide a comprehensive learning environment with modern facilities and experienced educators.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-gradient-to-r from-primary to-primary/80",
                "p-8 md:p-12 text-center"
              )}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
                  Register today and take the first step towards a brighter future. 
                  Our admissions team is ready to help you.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/materials">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/10"
                    >
                      Browse Materials
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}