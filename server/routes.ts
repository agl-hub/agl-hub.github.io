# FixNotify Clone - Feature Development

I'll build a comprehensive set of functional modules for the FixNotify clone, covering user authentication, service scheduling, reporting, and external API integrations.

## Project Structure

```
fixnotify/
├── src/
│   ├── auth/
│   │   ├── authController.js
│   │   ├── authMiddleware.js
│   │   └── authService.js
│   ├── scheduling/
│   │   ├── scheduleController.js
│   │   ├── scheduleService.js
│   │   └── reminderService.js
│   ├── notifications/
│   │   ├── smsService.js
│   │   ├── emailService.js
│   │   └── notificationQueue.js
│   ├── reporting/
│   │   ├── reportController.js
│   │   └── reportService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── ServiceAppointment.js
│   │   └── Notification.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   └── app.js
├── tests/
│   ├── auth.test.js
│   ├── scheduling.test.js
│   ├── notifications.test.js
│   └── reporting.test.js
├── .env.example
└── package.json
```

## 1. Package Configuration

```json
// package.json
{
  "name": "fixnotify-clone",
  "version": "1.0.0",
  "description": "Service appointment notification system",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --coverage --detectOpenHandles",
    "test:watch": "jest --watch",
    "lint": "eslint src/ tests/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "twilio": "^4.16.0",
    "@sendgrid/mail": "^7.7.0",
    "node-cron": "^3.0.2",
    "bull": "^4.11.3",
    "ioredis": "^5.3.2",
    "winston": "^3.10.0",
    "date-fns": "^2.30.0",
    "uuid": "^9.0.0",
    "joi": "^17.10.1",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1",
    "eslint": "^8.48.0",
    "mongodb-memory-server": "^9.0.1"
  }
}
```

## 2. Environment Configuration

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/fixnotify

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fixnotify.com
SENDGRID_FROM_NAME=FixNotify

# Redis (for Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App Settings
FRONTEND_URL=http://localhost:3001
REMINDER_HOURS_BEFORE=24
MAX_RESCHEDULE_COUNT=3
```

## 3. Database Models

```javascript
// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: ['customer', 'technician', 'admin'],
      default: 'customer',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      reminderHours: { type: Number, default: 24 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
    profilePicture: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (t) => t.expiresAt > now
  );
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
```

```javascript
// src/models/ServiceAppointment.js
const mongoose = require('mongoose');

const serviceAppointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'repair',
        'maintenance',
        'installation',
        'inspection',
        'consultation',
        'emergency',
      ],
    },
    serviceCategory: {
      type: String,
      required: [true, 'Service category is required'],
      enum: [
        'plumbing',
        'electrical',
        'hvac',
        'appliance',
        'roofing',
        'general',
        'other',
      ],
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date/time is required'],
    },
    estimatedDuration: {
      type: Number, // minutes
      default: 60,
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'rescheduled',
        'no_show',
      ],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    notes: {
      customer: String,
      technician: String,
      internal: String,
    },
    rescheduleCount: {
      type: Number,
      default: 0,
    },
    rescheduleHistory: [
      {
        previousDate: Date,
        newDate: Date,
        reason: String,
        rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rescheduledAt: { type: Date, default: Date.now },
      },
    ],
    reminders: [
      {
        type: { type: String, enum: ['24h', '2h', '1h', 'custom'] },
        sentAt: Date,
        channel: { type: String, enum: ['email', 'sms', 'both'] },
        status: { type: String, enum: ['pending', 'sent', 'failed'] },
      },
    ],
    cost: {
      estimated: Number,
      actual: Number,
      currency: { type: String, default: 'USD' },
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: End time
serviceAppointmentSchema.virtual('scheduledEndAt').get(function () {
  if (!this.scheduledAt || !this.estimatedDuration) return null;
  return new Date(
    this.scheduledAt.getTime() + this.estimatedDuration * 60 * 1000
  );
});

// Virtual: Is upcoming
serviceAppointmentSchema.virtual('isUpcoming').get(function () {
  return this.scheduledAt > new Date() && this.status !== 'cancelled';
});

// Indexes
serviceAppointmentSchema.index({ customer: 1, status: 1 });
serviceAppointmentSchema.index({ technician: 1, scheduledAt: 1 });
serviceAppointmentSchema.index({ scheduledAt: 1, status: 1 });
serviceAppointmentSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('ServiceAppointment', serviceAppointmentSchema);
```

```javascript
// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceAppointment',
    },
    type: {
      type: String,
      enum: [
        'appointment_confirmation',
        'appointment_reminder',
        'appointment_cancelled',
        'appointment_rescheduled',
        'technician_assigned',
        'technician_en_route',
        'service_completed',
        'review_request',
        'account_verification',
        'password_reset',
        'general',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'both'],
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'],
      default: 'queued',
    },
    subject: String,
    message: {
      type: String,
      required: true,
    },
    metadata: {
      twilioSid: String,
      sendgridMessageId: String,
      errorCode: String,
      errorMessage: String,
      retryCount: { type: Number, default: 0 },
      deliveredAt: Date,
    },
    scheduledFor: Date,
    sentAt: Date,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ appointment: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

## 4. Utility Modules

```javascript
// src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
```

```javascript
// src/utils/errorHandler.js
const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (err.statusCode >= 500) {
    logger.error('Server Error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });
  } else {
    logger.warn('Client Error', {
      error: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Handle specific error types
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      code: 'INVALID_ID',
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 'fail',
      code: 'DUPLICATE_FIELD',
      message: `${field} already exists`,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: messages.join(', '),
    });
  }

  // Operational errors: safe to send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      code: err.code,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming errors: hide details in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message;

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  globalErrorHandler,
};
```

```javascript
// src/utils/validators.js
const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .messages({
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number, and special character',
  });

const phoneSchema = Joi.string()
  .pattern(/^\+?[1-9]\d{1,14}$/)
  .messages({ 'string.pattern.base': 'Invalid phone number format' });

const validators = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    phone: phoneSchema.required(),
    password: passwordSchema.required(),
    role: Joi.string().valid('customer', 'technician').default('customer'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createAppointment: Joi.object({
    serviceType: Joi.string()
      .valid('repair', 'maintenance', 'installation', 'inspection', 'consultation', 'emergency')
      .required(),
    serviceCategory: Joi.string()
      .valid('plumbing', 'electrical', 'hvac', 'appliance', 'roofing', 'general', 'other')
      .required(),
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().max(1000),
    scheduledAt: Joi.date().greater('now').required().messages({
      'date.greater': 'Scheduled date must be in the future',
    }),
    estimatedDuration: Joi.number().min(15).max(480).default(60),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
    }).required(),
    notes: Joi.object({
      customer: Joi.string().max(500),
    }),
  }),

  rescheduleAppointment: Joi.object({
    newScheduledAt: Joi.date().greater('now').required(),
    reason: Joi.string().min(10).max(500).required(),
  }),

  updateNotificationPreferences: Joi.object({
    email: Joi.boolean(),
    sms: Joi.boolean(),
    reminderHours: Joi.number().valid(1, 2, 4, 12, 24, 48),
  }),

  reportQuery: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
    serviceType: Joi.string().valid(
      'repair', 'maintenance', 'installation', 'inspection', 'consultation', 'emergency'
    ),
    status: Joi.string().valid(
      'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'
    ),
    technicianId: Joi.string().hex().length(24),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(422).json({
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    });
  }

  req.body = value;
  next();
};

module.exports = { validators, validate };
```

## 5. Authentication Module

```javascript
// src/auth/authService.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { addDays, addHours } = require('date-fns');
const User = require('../models/User');
const { AppError, ConflictError, UnauthorizedError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class AuthService {
  // Generate JWT tokens
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  // Generate secure random token
  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash token for storage
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(userData) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError('Email address is already registered');
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      throw new ConflictError('Phone number is already registered');
    }

    // Generate email verification token
    const verificationToken = this.generateSecureToken();
    const hashedToken = this.hashToken(verificationToken);

    const user = await User.create({
      ...userData,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: addHours(new Date(), 24),
    });

    logger.info('New user registered', { userId: user._id, email: user.email });

    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Store refresh token
    const refreshExpiry = addDays(new Date(), 30);
    user.refreshTokens.push({
      token: this.hashToken(refreshToken),
      expiresAt: refreshExpiry,
    });
    await user.save({ validateBeforeSave: false });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      verificationToken, // Send via email
    };
  }

  async login(email, password, ipAddress) {
    // Find user with password
    const user = await User.findOne({ email, isActive: true }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError(
        'Please verify your email before logging in'
      );
    }

    // Update last login
    user.lastLoginAt = new Date();

    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Clean expired tokens and add new one
    user.cleanExpiredTokens();
    user.refreshTokens.push({
      token: this.hashToken(refreshToken),
      expiresAt: addDays(new Date(), 30),
    });

    await user.save({ validateBeforeSave: false });

    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      ip: ipAddress,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    const hashedToken = this.hashToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': hashedToken,
      'refreshTokens.expiresAt': { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedError('Refresh token not found or expired');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user._id);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== hashedToken
    );
    user.refreshTokens.push({
      token: this.hashToken(newRefreshToken),
      expiresAt: addDays(new Date(), 30),
    });

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    const hashedToken = this.hashToken(refreshToken);
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: hashedToken } },
    });
    logger.info('User logged out', { userId });
  }

  async verifyEmail(token) {
    const hashedToken = this.hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info('Email verified', { userId: user._id });
    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email, isActive: true });
    // Always return success (don't reveal if email exists)
    if (!user) return null;

    const resetToken