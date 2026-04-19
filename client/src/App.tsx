# FixNotify Dashboard - Premium Frontend Implementation

I'll create a modern, responsive, and visually appealing dashboard for the FixNotify clone with an exceptional user experience and premium design aesthetics.

## Project Structure

```
fixnotify-frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── Button.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SidebarItem.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── OverviewCard.jsx
│   │   │   │   └── UpcomingAppointmentsCard.jsx
│   │   │   ├── appointments/
│   │   │   │   ├── AppointmentForm.jsx
│   │   │   │   ├── AppointmentList.jsx
│   │   │   │   └── AppointmentDetails.jsx
│   │   │   ├── scheduling/
│   │   │   │   ├── CalendarView.jsx
│   │   │   │   └── Scheduler.jsx
│   │   │   ├── notifications/
│   │   │   │   └── NotificationFeed.jsx
│   │   │   └── settings/
│   │   │       └── ProfileSettings.jsx
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Chip.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   ├── StatisticCard.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── hooks/
│   │       ├── useAuth.jsx
│   │       ├── useApi.jsx
│   │       └── useDarkMode.jsx
│   ├── assets/
│   │   └── icons/
│   │       ├── dashboard.jsx
│   │       ├── appointments.jsx
│   │       └── settings.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── utilities.css
│   ├── utils/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── date.js
│   │   └── helpers.js
│   ├── router/
│   │   └── AppRouter.jsx
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Core Application Files

### 1. Package Configuration

```json
{
  "name": "fixnotify-frontent",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "tailwindcss": "^3.3.3",
    "axios": "^1.5.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.279.0",
    "react-calendar": "^4.6.1",
    "react-hook-form": "^7.45.4",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "react-hot-toast": "^2.4.1",
    "react-datepicker": "^4.17.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.4",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29",
    "eslint": "^8.48.0",
    "eslint-plugin-react": "^7.33.2",
    "prettier": "^3.0.3"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2. Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#451a03',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        display: ['Montserrat Alternates', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
```

### 3. Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@300;400;500;600;700&display=swap');

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading font-bold text-gray-900;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors;
  }
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm;
  }
  
  .btn-secondary {
    @apply px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200;
  }
  
  .input-field {
    @apply w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200 bg-white placeholder-gray-500;
  }
  
  .form-section {
    @apply mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200;
  }
  
  .table-row {
    @apply border-b border-gray-200 hover:bg-gray-50 transition-colors;
  }
  
  .status-badge {
    @apply px-3 py-1 rounded-full text-xs font-semibold capitalize;
  }
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 4. Core Application Setup

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import AuthProvider from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 5. Auth Context

```jsx
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);
        toast.success('Welcome back!');
      }
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.register(data);
      
      if (response.success) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);
        toast.success('Account created successfully!');
      }
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
```

### 6. API Utilities

```javascript
// src/utils/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
};

// Appointment API functions
export const appointmentAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  },

  create: async (appointment) => {
    try {
      const response = await api.post('/appointments', appointment);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },

  update: async (id, appointment) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointment);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete appointment');
    }
  },

  reschedule: async (id, rescheduleData) => {
    try {
      const response = await api.patch(`/appointments/${id}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  },
};

// Notification API functions
export const notificationAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark as read');
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  },
};

export default api;
```

### 7. Common Components

```jsx
// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2 
      className={`animate-spin text-primary-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

export default LoadingSpinner;
```

```jsx
// src/components/common/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-base',
  };

  const handleClick = (e) => {
    if (!disabled && !loading) {
      onClick?.(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-primary-500 disabled:pointer-events-none disabled:opacity-50
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {iconLeft && !loading && (
        <span className="mr-2">{iconLeft}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="ml-2">{iconRight}</span>
      )}
    </motion.button>
  );
};

export default Button;
```

### 8. Layout Components

```jsx
// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Bell, Search, Menu, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">Welcome, {user?.firstName}!</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            
            <div className="relative">
              <img
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=667eea&color=fff`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary-200"
              />
              <div className="absolute inset-0 rounded-full ring-2 ring-primary-200 ring-offset-1 pointer-events-none"></div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

```jsx
// src/components/layout/SidebarItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, href, isActive }) => {
  return (
    <Link to={href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer
          transition-all duration-200 relative overflow-hidden
          ${isActive 
            ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 border-l-4 border-primary-500' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{label}</span>
        
        {isActive && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          />
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarItem;
```

```jsx
// src/components/layout/Sidebar.jsx
import React from {react';
import { Home, Calendar, Bell, Settings, Users, CreditCard, FileText } from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Appointments', href: '/appointments' },
    { icon: Users, label: 'Schedule', href: '/schedule' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: CreditCard, label: 'Billing', href: '/billing' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleOverlayClick = () => {
    onClose();
  };

  const sidebarClasses = `
    fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200
    transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FixNotify</h1>
              <p className="text-sm text-gray-500">Service Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                />
              </motion.div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg p-4 text-white">
              <h4 className="font-semibold text-accent-100">Premium Plan</h4>
              <p className="text-sm text-accent-200 mt-1">Unlimited appointments</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
```

### 9. Dashboard Components

```jsx
// src/components/pages/dashboard/OverviewCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, UserCheck, MessageCircle } from 'lucide-react';

const OverviewCard = ({ title, count, change, icon: Icon, color, progress }) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    secondary: 'text-secondary-600 bg-secondary-100',
    accent: 'text-accent-600 bg-accent-100',
    danger: 'text-danger-600 bg-danger-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 bg-primary-600 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OverviewCard;
```

```jsx
// src/components/pages/dashboard/UpcomingAppointmentsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import moment from 'moment';
import StatusBadge from '../../ui/StatusBadge';

const UpcomingAppointmentsCard = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
        <p className="text-gray-500">Create a new appointment to get started</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          <span className="text-sm text-gray-500">{appointments.length} total</span>
        </div>
        
        <div className="space-y-4">
          {appointments.slice(0, 5).map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                  <StatusBadge status={appointment.status} />
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{moment(appointment.scheduledAt).format('MMM D, h:mm A')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.location.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.customer.phone || 'No contact info'}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">{appointment.serviceType}</p>
                <p className="text-sm font-medium text-gray-700">
                  {moment(appointment.scheduledAt).fromNow()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {appointments.length > 5 && (
          <div className="mt-6 text-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View All ({appointments.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsCard;
```

### 10. Appointment Form

```jsx
// src/components/pages/appointments/AppointmentForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, UserPlus } from 'lucide-react';
import Button from '../../common/Button';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = ({ onSubmit, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceType: initialData.serviceType || 'repair',
    serviceCategory: initialData.serviceCategory || 'plumbing',
    title: initialData.title || '',
    description: initialData.description || '',
    scheduledAt: initialData.scheduledAt || new Date(),
    estimatedDuration: initialData.estimatedDuration || 60,
    priority: initialData.priority || 'normal',
    location: {
      address: initialData.location?.address || '',
      city: initialData.location?.city || '',
      state: initialData.location?.state || '',
      zipCode: initialData.location?.zipCode || '',
    },
    notes: {
      customer: initialData.notes?.customer || '',
    },
  });
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    { value: 'repair', label: 'Repair' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'installation', label: 'Installation' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency' },
  ];

  const serviceCategories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'general', label: 'General' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleChange = (e