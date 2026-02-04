"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, User, Mail, Phone, Calendar, MapPin, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Input, Select, Textarea } from "@/components/Input";
import { publicApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
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

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    previous_school: "",
    grade_applying: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_notes: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "first_name", "last_name", "email", "phone",
      "date_of_birth", "gender", "address",
      "parent_name", "parent_phone", "grade_applying",
      "emergency_contact", "emergency_phone"
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Validation Error", "Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await publicApi.registerStudent(formData);
      
      if (response.success) {
        setIsSuccess(true);
        showSuccess("Registration Successful", response.message);
      } else {
        showError("Registration Failed", response.message);
      }
    } catch (error) {
      showError("Registration Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Registration Submitted!
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for registering. Our admissions team will review your application 
              and contact you soon via email.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => router.push("/")}>
                Go to Home
              </Button>
              <Button variant="outline" onClick={() => setIsSuccess(false)}>
                Submit Another
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.back()}
              className={cn(
                "inline-flex items-center gap-2 text-sm text-muted-foreground",
                "hover:text-foreground transition-colors mb-4"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Student Registration</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the form below to register for admission. Fields marked with * are required.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Student Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Student Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  error={errors.date_of_birth}
                  required
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={genderOptions}
                  error={errors.gender}
                  required
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Parent/Guardian Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Parent/Guardian Name"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  error={errors.parent_name}
                  required
                />
                <Input
                  label="Parent/Guardian Phone"
                  name="parent_phone"
                  type="tel"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  error={errors.parent_phone}
                  required
                />
                <Input
                  label="Parent/Guardian Email"
                  name="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={handleChange}
                  error={errors.parent_email}
                />
                <Input
                  label="Previous School (if any)"
                  name="previous_school"
                  value={formData.previous_school}
                  onChange={handleChange}
                />
                <Select
                  label="Grade Applying For"
                  name="grade_applying"
                  value={formData.grade_applying}
                  onChange={handleChange}
                  options={gradeOptions}
                  error={errors.grade_applying}
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Emergency Contact</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Emergency Contact Name"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  error={errors.emergency_contact}
                  required
                />
                <Input
                  label="Emergency Contact Phone"
                  name="emergency_phone"
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  error={errors.emergency_phone}
                  required
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Medical Notes / Allergies (if any)"
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                size="lg"
              >
                Submit Registration
              </Button>
            </div>
          </motion.form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}