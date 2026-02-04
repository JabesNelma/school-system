import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge tailwind classes with proper precedence
 * @param {...(string|object|boolean)} inputs - Class names to merge
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date
 */
export function formatDate(date, options = {}) {
  if (!date) return "N/A";
  
  const d = new Date(date);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };
  
  return new Intl.DateTimeFormat("en-US", defaultOptions).format(d);
}

/**
 * Format time for display
 * @param {string} time - Time string (HH:MM)
 * @returns {string} - Formatted time
 */
export function formatTime(time) {
  if (!time) return "N/A";
  
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return "?";
  
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if code is running on client side
 * @returns {boolean}
 */
export function isClient() {
  return typeof window !== "undefined";
}

/**
 * Get API URL based on environment
 * @returns {string} - API base URL
 */
export function getApiUrl() {
  if (isClient()) {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }
  return "http://localhost:5000";
}

/**
 * Store data in localStorage safely
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function setStorage(key, value) {
  if (isClient()) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }
}

/**
 * Get data from localStorage safely
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} - Stored value or default
 */
export function getStorage(key, defaultValue = null) {
  if (isClient()) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      return defaultValue;
    }
  }
  return defaultValue;
}

/**
 * Remove data from localStorage safely
 * @param {string} key - Storage key
 */
export function removeStorage(key) {
  if (isClient()) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from localStorage:", e);
    }
  }
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}