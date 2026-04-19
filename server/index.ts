# FixNotify - Production-Grade Backend Implementation

Building upon the architectural specification from Claude Opus 4.6 and addressing all gaps identified by the Contextual Knowledge Base, I'll implement the complete production-grade backend system.

## Repository Structure

```
src/
├── core/
│   ├── eventBus.js
│   ├── container.js          # Dependency injection
│   └── bootstrap.js          # Application bootstrap
├── config/
│   ├── index.js
│   ├── database.js
│   ├── redis.js
│   └── queue.js
├── middleware/
│   ├── auth.js
│   ├── rbac.js
│   ├── rateLimiter.js
│   ├── requestLogger.js
│   ├── errorHandler.js
│   └── validate.js
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.validators.js
│   ├── appointments/
│   │   ├── appointment.routes.js
│   │   ├── appointment.controller.js
│   │   ├── appointment.service.js
│   │   └── appointment.validators.js
│   ├── notifications/
│   │   ├── notification.routes.js
│   │   ├── notification.controller.js
│   │   ├── notification.service.js
│   │   ├── notification.queue.js
│   │   └── providers/
│   │       ├── email.provider.js
│   │       └── sms.provider.js
│   ├── scheduling/
│   │   ├── scheduling.service.js
│   │   └── scheduling.algorithm.js
│   ├── billing/
│   │   ├── billing.routes.js
│   │   ├── billing.controller.js
│   │   └── billing.service.js
│   ├── reporting/
│   │   ├── reporting.routes.js
│   │   ├── reporting.controller.js
│   │   └── reporting.service.js
│   └── users/
│       ├── user.routes.js
│       ├── user.controller.js
│       └── user.service.js
├── models/
│   ├── User.js
│   ├── ServiceAppointment.js
│   ├── Notification.js
│   ├── TechnicianProfile.js
│   ├── BillingRecord.js
│   └── AuditLog.js
├── utils/
│   ├── logger.js
│   ├── errors.js
│   ├── crypto.js
│   ├── pagination.js
│   └── helpers.js
└── app.js
```

---

## 1. Core Application Bootstrap

```javascript
// src/core/bootstrap.js
'use strict';

const logger = require('../utils/logger');
const database = require('../config/database');
const redisClient = require('../config/redis');
const { initializeQueues } = require('../config/queue');
const eventBus = require('./eventBus');

/**
 * Registers all inter-module event subscriptions
 * Central wiring of the application's event-driven architecture
 */
const registerEventSubscriptions = () => {
  const notificationService = require('../modules/notifications/notification.service');
  const schedulingService = require('../modules/scheduling/scheduling.service');
  const billingService = require('../modules/billing/billing.service');
  const auditService = require('../utils/audit');

  // ── Appointment Events ──────────────────────────────────────────
  eventBus.subscribe('appointment.created', async (payload) => {
    await notificationService.scheduleAppointmentReminders(payload.appointment);
    await auditService.log({
      actor: payload.createdBy,
      action: 'CREATE',
      resource: 'ServiceAppointment',
      resourceId: payload.appointment._id,
      changes: { after: payload.appointment },
    });
  }, 'NotificationModule');

  eventBus.subscribe('appointment.confirmed', async (payload) => {
    await notificationService.sendConfirmationNotification(payload.appointment);
    await schedulingService.blockTechnicianSlot(payload.appointment);
  }, 'SchedulingModule');

  eventBus.subscribe('appointment.completed', async (payload) => {
    await billingService.generateInvoice(payload.appointment);
    await notificationService.sendCompletionNotification(payload.appointment);
    await schedulingService.releaseTechnicianSlot(payload.appointment);
  }, 'BillingModule');

  eventBus.subscribe('appointment.cancelled', async (payload) => {
    await notificationService.sendCancellationNotification(payload.appointment, payload.reason);
    await schedulingService.releaseTechnicianSlot(payload.appointment);
    await billingService.processCancellationRefund(payload.appointment);
  }, 'AppointmentModule');

  eventBus.subscribe('technician.assigned', async (payload) => {
    await notificationService.sendTechnicianAssignmentNotification(payload);
  }, 'TechnicianModule');

  eventBus.subscribe('payment.completed', async (payload) => {
    await notificationService.sendPaymentConfirmation(payload);
    await auditService.log({
      actor: payload.customerId,
      action: 'PAYMENT_PROCESSED',
      resource: 'BillingRecord',
      resourceId: payload.billingId,
      changes: { after: { amount: payload.amount, status: 'paid' } },
    });
  }, 'BillingModule');

  eventBus.subscribe('user.registered', async (payload) => {
    await notificationService.sendWelcomeEmail(payload.user);
  }, 'NotificationModule');

  logger.info('✅ Event subscriptions registered');
};

/**
 * Main application bootstrap sequence
 */
const bootstrap = async (app) => {
  try {
    logger.info('🚀 Starting FixNotify application bootstrap...');

    // 1. Database connection
    await database.connect();
    logger.info('✅ MongoDB connected');

    // 2. Redis connection
    await redisClient.connect();
    logger.info('✅ Redis connected');

    // 3. Initialize Bull queues
    await initializeQueues();
    logger.info('✅ Job queues initialized');

    // 4. Register event subscriptions
    registerEventSubscriptions();

    // 5. Register graceful shutdown handlers
    registerShutdownHandlers();

    logger.info('✅ Application bootstrap complete');
    return true;
  } catch (error) {
    logger.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
};

const registerShutdownHandlers = () => {
  const gracefulShutdown = async (signal) => {
    logger.info(`📴 ${signal} received. Starting graceful shutdown...`);
    try {
      await database.disconnect();
      await redisClient.quit();
      logger.info('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('💥 Unhandled Rejection:', reason);
  });
};

module.exports = { bootstrap };
```

---

## 2. Complete Auth Module

```javascript
// src/modules/auth/auth.service.js
'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const eventBus = require('../../core/eventBus');
const { AppError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const redisClient = require('../../config/redis');
const config = require('../../config');

class AuthService {
  // ── Token Management ──────────────────────────────────────────────

  /**
   * Generates signed access + refresh token pair
   */
  generateTokenPair(userId, role) {
    const accessToken = jwt.sign(
      { sub: userId, role, type: 'access' },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry, issuer: 'fixnotify', audience: 'fixnotify-client' }
    );

    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry, issuer: 'fixnotify' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verifies access token and checks revocation list
   */
  async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret, {
        issuer: 'fixnotify',
        audience: 'fixnotify-client',
      });

      // Check revocation list (Redis blacklist)
      const isRevoked = await redisClient.get(`revoked:${token}`);
      if (isRevoked) {
        throw new AppError('Token has been revoked', 401, 'TOKEN_REVOKED');
      }

      return decoded;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
    }
  }

  /**
   * Adds token to Redis blacklist on logout
   */
  async revokeToken(token, expiresIn) {
    const ttl = Math.max(0, expiresIn - Math.floor(Date.now() / 1000));
    if (ttl > 0) {
      await redisClient.setEx(`revoked:${token}`, ttl, '1');
    }
  }

  // ── Registration ──────────────────────────────────────────────────

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    // Hash password with adaptive cost factor
    const saltRounds = config.security.bcryptRounds || 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const user = await User.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken: verificationHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    const { accessToken, refreshToken } = this.generateTokenPair(user._id, user.role);

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push({
      token: hashedRefresh,
      createdAt: new Date(),
      deviceInfo: userData.deviceInfo || 'Unknown',
    });
    await user.save();

    // Publish registration event
    eventBus.publish('user.registered', { user: user.toPublicJSON() });

    logger.info(`New user registered: ${user._id}`, { email: user.email, role: user.role });

    return {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
      emailVerificationToken: verificationToken, // Plain token sent via email
    };
  }

  // ── Login ─────────────────────────────────────────────────────────

  async login(email, password, deviceInfo = 'Unknown') {
    // Fetch user including password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      // Timing-safe rejection — still run bcrypt to prevent timing attacks
      await bcrypt.compare(password, '$2b$12$invalidhashfortimingattackprevention');
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this._handleFailedLogin(user);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed login tracking on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLoginAt = new Date();

    const { accessToken, refreshToken } = this.generateTokenPair(user._id, user.role);

    // Prune old refresh tokens (keep last 5 devices)
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push({ token: hashedRefresh, createdAt: new Date(), deviceInfo });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    logger.info(`User logged in: ${user._id}`, { email: user.email, deviceInfo });

    return {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    };
  }

  async _handleFailedLogin(user) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    
    const MAX_ATTEMPTS = config.security.maxLoginAttempts || 5;
    const LOCKOUT_DURATION = config.security.lockoutDuration || 15 * 60 * 1000; // 15 min

    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
      logger.warn(`Account locked: ${user._id}`, { attempts: user.failedLoginAttempts });
    }

    await user.save({ validateBeforeSave: false });
  }

  // ── Token Refresh ─────────────────────────────────────────────────

  async refreshTokens(incomingRefreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshSecret, {
        issuer: 'fixnotify',
      });
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'REFRESH_TOKEN_INVALID');
    }

    const user = await User.findById(decoded.sub).select('+refreshTokens');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Find and validate the stored hashed refresh token
    let matchedTokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshTokens[i].token);
      if (isMatch) {
        matchedTokenIndex = i;
        break;
      }
    }

    if (matchedTokenIndex === -1) {
      // Token reuse detected — revoke ALL tokens (compromise response)
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      logger.warn(`Refresh token reuse detected for user: ${user._id}`);
      throw new AppError('Security alert: Token reuse detected. Please log in again.', 401, 'TOKEN_REUSE');
    }

    // Rotate: remove old, issue new
    user.refreshTokens.splice(matchedTokenIndex, 1);
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(user._id, user.role);
    const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokens.push({
      token: hashedNewRefresh,
      createdAt: new Date(),
      deviceInfo: user.refreshTokens[matchedTokenIndex]?.deviceInfo || 'Unknown',
    });

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ── Email Verification ────────────────────────────────────────────

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for user: ${user._id}`);
    return user.toPublicJSON();
  }

  // ── Password Reset ────────────────────────────────────────────────
  // RESOLVES GAP #3 from Contextual Knowledge Base Report

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    if (!user.isActive) {
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    // Generate cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Queue password reset email
    const notificationService = require('../notifications/notification.service');
    await notificationService.sendPasswordResetEmail(user, resetToken);

    logger.info(`Password reset token generated for user: ${user._id}`);

    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    // Prevent password reuse (check last 5 passwords)
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const oldHash of user.passwordHistory.slice(-5)) {
        const isReused = await bcrypt.compare(newPassword, oldHash);
        if (isReused) {
          throw new AppError(
            'New password must be different from your last 5 passwords',
            400,
            'PASSWORD_REUSE'
          );
        }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds || 12);

    // Archive old password
    user.passwordHistory = user.passwordHistory || [];
    user.passwordHistory.push(user.password);
    if (user.passwordHistory.length > 10) {
      user.passwordHistory = user.passwordHistory.slice(-10);
    }

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    
    // Invalidate all existing sessions on password change
    user.refreshTokens = [];
    
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset completed for user: ${user._id}`);

    // Send confirmation email
    const notificationService = require('../notifications/notification.service');
    await notificationService.sendPasswordChangedEmail(user);

    return { message: 'Password successfully reset. Please log in with your new password.' };
  }

  // ── Logout ────────────────────────────────────────────────────────

  async logout(userId, accessToken, refreshToken) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) return;

    // Revoke access token in Redis blacklist
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded?.exp) {
          await this.revokeToken(accessToken, decoded.exp);
        }
      } catch (e) {
        logger.warn(`Failed to revoke access token for user ${userId}`);
      }
    }

    // Remove specific refresh token
    if (refreshToken) {
      const tokenList = [...user.refreshTokens];
      for (let i = 0; i < tokenList.length; i++) {
        const isMatch = await bcrypt.compare(refreshToken, tokenList[i].token);
        if (isMatch) {
          user.refreshTokens.splice(i, 1);
          break;
        }
      }
    }

    await user.save({ validateBeforeSave: false });
    logger.info(`User logged out: ${userId}`);
  }

  async logoutAll(userId, accessToken) {
    const user = await User.findById(userId);
    if (!user) return;

    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded?.exp) await this.revokeToken(accessToken, decoded.exp);
      } catch (e) { /* silent */ }
    }

    logger.info(`All sessions terminated for user: ${userId}`);
  }
}

module.exports = new AuthService();
```

---

## 3. Complete Appointments Module

```javascript
// src/modules/appointments/appointment.service.js
'use strict';

const ServiceAppointment = require('../../models/ServiceAppointment');
const TechnicianProfile = require('../../models/TechnicianProfile');
const eventBus = require('../../core/eventBus');
const { AppError } = require('../../utils/errors');
const schedulingAlgorithm = require('../scheduling/scheduling.algorithm');
const { buildPaginationMeta } = require('../../utils/pagination');
const logger = require('../../utils/logger');
const redisClient = require('../../config/redis');

class AppointmentService {
  // ── Create ────────────────────────────────────────────────────────

  async createAppointment(appointmentData, createdBy) {
    const { scheduledAt, estimatedDuration, location, serviceCategory, priority } = appointmentData;

    // Validate scheduling time (no past dates, business hours for non-urgent)
    this._validateSchedulingTime(scheduledAt, priority);

    // Auto-assign technician if not specified
    let technicianId = appointmentData.technician;
    if (!technicianId) {
      technicianId = await schedulingAlgorithm.findOptimalTechnician({
        scheduledAt: new Date(scheduledAt),
        duration: estimatedDuration,
        location,
        serviceCategory,
        priority,
      });
    }

    const appointment = await ServiceAppointment.create({
      ...appointmentData,
      customer: appointmentData.customer || createdBy,
      technician: technicianId,
      status: technicianId ? 'confirmed' : 'pending',
    });

    await appointment.populate(['customer', 'technician']);

    // Publish creation event
    eventBus.publish('appointment.created', {
      appointment: appointment.toObject(),
      createdBy,
    });

    if (technicianId) {
      eventBus.publish('technician.assigned', {
        appointment: appointment.toObject(),
        technicianId,
      });
    }

    // Invalidate dashboard cache
    await this._invalidateDashboardCache(appointment.customer._id);

    logger.info(`Appointment created: ${appointment.appointmentId}`, {
      customer: appointment.customer._id,
      technician: technicianId,
      scheduledAt,
    });

    return appointment;
  }

  // ── Read Operations ───────────────────────────────────────────────

  async getAppointments(filters, paginationOpts, requestingUser) {
    const { page = 1, limit = 20, sort = '-createdAt' } = paginationOpts;
    const query = this._buildAppointmentQuery(filters, requestingUser);

    const [appointments, total] = await Promise.all([
      ServiceAppointment.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('customer', 'firstName lastName email phone profilePicture')
        .populate('technician', 'firstName lastName email phone')
        .lean(),
      ServiceAppointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getAppointmentById(appointmentId, requestingUser) {
    const cacheKey = `appointment:${appointmentId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const appointment = await ServiceAppointment.findById(appointmentId)
      .populate('customer', 'firstName lastName email phone address profilePicture')
      .populate('technician', 'firstName lastName email phone')
      .populate({
        path: 'technician',
        populate: { path: 'technicianProfile' },
      });

    if (!appointment) {
      throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
    }

    // Enforce access control
    this._enforceAppointmentAccess(appointment, requestingUser);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(appointment)); // Cache 5min

    return appointment;
  }

  async getDashboardStats(userId, role, dateRange) {
    const cacheKey = `dashboard:stats:${userId}:${dateRange}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { startDate, endDate } = this._parseDateRange(dateRange);
    const matchQuery = this._buildDashboardQuery(userId, role, startDate, endDate);

    const [stats, trends, recentActivity] = await Promise.all([
      this._computeStatusStats(matchQuery),
      this._computeTrends(matchQuery, startDate, endDate),
      this._getRecentActivity(userId, role),
    ]);

    const result = { stats, trends, recentActivity };

    await redisClient.setEx(cacheKey, 180, JSON.stringify(result)); // Cache 3min

    return result;
  }

  async _computeStatusStats(matchQuery) {
    const result = await ServiceAppointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$estimatedDuration' },
          totalRevenue: { $sum: '$cost.estimated' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const statMap = result.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        avgDuration: Math.round(item.avgDuration || 0),
        totalRevenue: item.totalRevenue || 0,
      };
      return acc;
    }, {});

    const total = result.reduce((sum, item) => sum + item.count, 0);

    return {
      total,
      byStatus: statMap,
      completionRate: total > 0
        ? (((statMap.completed?.count || 0) / total) * 100).toFixed(1)
        : 0,
    };
  }

  async _computeTrends(matchQuery, startDate, endDate) {
    return ServiceAppointment.aggregate([
      { $match: { ...matchQuery, scheduledAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledAt' },
            month: { $month: '$scheduledAt' },
            day: { $dayOfMonth: '$scheduledAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          revenue: { $sum: '$cost.actual' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          count: 1,
          completed: 1,
          revenue: 1,
        },
      },
    ]);
  }

  async _getRecentActivity(userId, role) {
    const query = role === 'admin' ? {} : role === 'technician'
      ? { technician: userId }
      : { customer: userId };

    return ServiceAppointment.find(query)
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName')
      .select('appointmentId title status scheduledAt serviceType updatedAt')
      .lean();
  }

  // ── Update Operations ─────────────────────────────────────────────

  async updateAppointment(appointmentId, updateData, requestingUser) {
    const appointment = await ServiceAppointment.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
    }

    this._enforceAppointmentAccess(appointment, requestingUser);
    this._validateStatusTransition(appointment.status, updateData.status);

    const previousState = appointment.toObject();

    // Apply updates
    Object.assign(appointment, updateData);

    // If status changed to completed, set completion timestamp
    if (updateData.status === 'completed' && previousState.status !==