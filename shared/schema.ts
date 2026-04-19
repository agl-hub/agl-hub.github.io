

# FixNotify Enhanced Architecture Specification

## System Architecture Document v2.0

---

## Executive Summary

This document presents the definitive architectural blueprint for the enhanced FixNotify platform. It synthesizes findings from all prior agent outputs—backend feature modules, frontend components, visual design specifications, and the contextual knowledge base report—into a cohesive, scalable, and secure system design. The architecture addresses all identified gaps, resolves inconsistencies, and establishes a clear path toward production readiness and future AI-driven enhancements.

---

## 1. Architectural Philosophy & Principles

### 1.1 Core Design Tenets

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURAL PRINCIPLES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Modular Monolith First → Microservices When Justified       │
│  2. Event-Driven Communication for Loose Coupling               │
│  3. Defense in Depth for Security                                │
│  4. Schema-First API Design                                      │
│  5. Observability as a First-Class Citizen                       │
│  6. Progressive Enhancement for Frontend                         │
│  7. Infrastructure as Code                                       │
│  8. Zero-Trust Network Architecture                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Why Modular Monolith First

The current project state reveals a well-structured Express application. Rather than prematurely decomposing into microservices—which would introduce operational complexity disproportionate to the current team size and feature set—the architecture adopts a **modular monolith** pattern with clearly defined domain boundaries. Each module is designed for eventual extraction into an independent service when scaling demands justify it.

---

## 2. High-Level System Architecture

### 2.1 System Context Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ACTORS                                │
│                                                                       │
│   ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    │
│   │ Customer  │    │Technician│    │   Admin   │    │ External │    │
│   │  (Web/    │    │  (Web/   │    │  (Web)    │    │ Systems  │    │
│   │  Mobile)  │    │  Mobile) │    │           │    │          │    │
│   └─────┬─────┘    └────┬─────┘    └─────┬─────┘    └────┬─────┘    │
│         │               │                │                │          │
└─────────┼───────────────┼────────────────┼────────────────┼──────────┘
          │               │                │                │
          ▼               ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CDN / EDGE LAYER                             │
│                    (CloudFront / Cloudflare)                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Static Assets │ DDoS Protection │ SSL Termination │ Cache  │   │
│   └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                              │
│                    (Kong / AWS API Gateway)                          │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │ Rate Limiting │ Auth Validation │ Request Routing │ Logging │   │
│   └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                                  │
│              (Modular Monolith - Node.js/Express)                    │
│                                                                       │
│   ┌───────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│   │   Auth    │ │ Appointments │ │Notifications │ │  Reporting │  │
│   │  Module   │ │   Module     │ │   Module     │ │   Module   │  │
│   └───────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
│   ┌───────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│   │  Billing  │ │  Scheduling  │ │    Users     │ │  AI/ML     │  │
│   │  Module   │ │   Module     │ │   Module     │ │  Module    │  │
│   └───────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              EVENT BUS (Internal Pub/Sub)                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
└──────────┬──────────────┬──────────────┬──────────────┬─────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ MongoDB  │  │  Redis   │  │   S3     │  │  Elasticsearch    │  │
│  │ (Primary │  │ (Cache/  │  │ (Files/  │  │  (Search/Logs)    │  │
│  │  Store)  │  │  Queue)  │  │  Media)  │  │                   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                  │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Twilio  │  │ SendGrid │  │  Stripe  │  │  Google Maps API  │  │
│  │  (SMS)   │  │ (Email)  │  │(Payments)│  │  (Geocoding)      │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TOPOLOGY                            │
│                                                                   │
│  ┌─── Production ─────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐  │ │
│  │  │  App Node 1 │    │  App Node 2 │    │  App Node 3  │  │ │
│  │  │  (Primary)  │    │  (Primary)  │    │  (Primary)   │  │ │
│  │  └──────┬──────┘    └──────┬──────┘    └──────┬───────┘  │ │
│  │         │                  │                   │          │ │
│  │         └──────────────────┼───────────────────┘          │ │
│  │                            │                              │ │
│  │                    ┌───────┴───────┐                      │ │
│  │                    │  Load Balancer│                      │ │
│  │                    └───────────────┘                      │ │
│  │                                                           │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐  │ │
│  │  │  MongoDB    │    │  MongoDB    │    │  MongoDB     │  │ │
│  │  │  Primary    │◄──►│  Secondary  │◄──►│  Secondary   │  │ │
│  │  └─────────────┘    └─────────────┘    └──────────────┘  │ │
│  │                                                           │ │
│  │  ┌─────────────┐    ┌─────────────┐                      │ │
│  │  │ Redis Master│◄──►│Redis Replica│                      │ │
│  │  └─────────────┘    └─────────────┘                      │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │         Worker Nodes (Bull Queue Processors)        │  │ │
│  │  │   ┌──────────┐  ┌──────────┐  ┌──────────────┐    │  │ │
│  │  │   │Notif Wkr │  │Email Wkr │  │ Schedule Wkr │    │  │ │
│  │  │   └──────────┘  └──────────┘  └──────────────┘    │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── Staging ────────────────────────────────────────────────┐ │
│  │  (Mirror of Production with reduced node counts)           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (Entity Relationship Diagram)

### 3.1 Complete ERD

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────┐
│        USERS         │         │    SERVICE_APPOINTMENTS   │
├──────────────────────┤         ├──────────────────────────┤
│ _id          ObjectId│◄────┐   │ _id            ObjectId  │
│ firstName     String │     │   │ appointmentId   String   │
│ lastName      String │     ├───│ customer        ObjectId │
│ email         String │     │   │ technician      ObjectId │
│ phone         String │     │   │ serviceType     String   │
│ password      String │     │   │ serviceCategory String   │
│ role          Enum   │     │   │ title           String   │
│ isEmailVerified Bool │     │   │ description     String   │
│ emailVerifToken Str  │     │   │ scheduledAt     Date     │
│ emailVerifExp  Date  │     │   │ estimatedDuration Number │
│ pwdResetToken  Str   │     │   │ status          Enum     │
│ pwdResetExp    Date  │     │   │ priority        Enum     │
│ refreshTokens [Obj]  │     │   │ location        Object   │
│ notifPrefs    Object │     │   │ notes           Object   │
│ isActive      Bool   │     │   │ rescheduleCount Number   │
│ lastLoginAt   Date   │     │   │ rescheduleHistory [Obj]  │
│ profilePicture Str   │     │   │ reminders       [Obj]    │
│ address       Object │     │   │ cost            Object   │
│ createdAt     Date   │     │   │ rating          Object   │
│ updatedAt     Date   │     │   │ completedAt     Date     │
└──────────┬───────────┘     │   │ cancelledAt     Date     │
           │                 │   │ cancelReason    String   │
           │                 │   │ createdAt       Date     │
           │                 │   │ updatedAt       Date     │
           │                 │   └────────────┬─────────────┘
           │                 │                │
           │                 │                │
           ▼                 │                ▼
┌──────────────────────┐     │   ┌──────────────────────────┐
│    NOTIFICATIONS     │     │   │   TECHNICIAN_PROFILES    │
├──────────────────────┤     │   ├──────────────────────────┤
│ _id          ObjectId│     │   │ _id            ObjectId  │
│ recipient    ObjectId│─────┘   │ user           ObjectId  │──┐
│ appointment  ObjectId│─────────│ specializations [String] │  │
│ type          Enum   │         │ certifications  [Object] │  │
│ channel       Enum   │         │ serviceAreas    [Object] │  │
│ status        Enum   │         │ availability    Object   │  │
│ subject       String │         │ averageRating   Number   │  │
│ message       String │         │ totalJobs       Number   │  │
│ metadata      Object │         │ isAvailable     Bool     │  │
│ scheduledFor  Date   │         │ hourlyRate      Number   │  │
│ sentAt        Date   │         │ createdAt       Date     │  │
│ isRead        Bool   │         │ updatedAt       Date     │  │
│ readAt        Date   │         └──────────────────────────┘  │
│ createdAt     Date   │                                       │
│ updatedAt     Date   │                                       │
└──────────────────────┘         ┌──────────────────────────┐  │
                                 │     AUDIT_LOG            │  │
┌──────────────────────┐         ├──────────────────────────┤  │
│   BILLING_RECORDS    │         │ _id            ObjectId  │  │
├──────────────────────┤         │ actor          ObjectId  │──┘
│ _id          ObjectId│         │ action         String    │
│ appointment  ObjectId│         │ resource       String    │
│ customer     ObjectId│         │ resourceId     ObjectId  │
│ amount        Number │         │ changes        Object    │
│ currency      String │         │ ipAddress      String    │
│ status        Enum   │         │ userAgent      String    │
│ paymentMethod Object │         │ timestamp      Date      │
│ invoiceNumber String │         └──────────────────────────┘
│ stripePayIntId Str   │
│ paidAt        Date   │         ┌──────────────────────────┐
│ refundedAt    Date   │         │    SYSTEM_CONFIG         │
│ createdAt     Date   │         ├──────────────────────────┤
│ updatedAt     Date   │         │ _id            ObjectId  │
└──────────────────────┘         │ key            String    │
                                 │ value          Mixed     │
                                 │ category       String    │
                                 │ description    String    │
                                 │ isEncrypted    Bool      │
                                 │ updatedBy      ObjectId  │
                                 │ updatedAt      Date      │
                                 └──────────────────────────┘
```

### 3.2 New & Enhanced Models

```javascript
// src/models/TechnicianProfile.js
const mongoose = require('mongoose');

const technicianProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specializations: [
      {
        type: String,
        enum: [
          'plumbing',
          'electrical',
          'hvac',
          'appliance',
          'roofing',
          'general',
        ],
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuedBy: String,
        issuedAt: Date,
        expiresAt: Date,
        documentUrl: String,
        verified: { type: Boolean, default: false },
      },
    ],
    serviceAreas: [
      {
        zipCode: String,
        city: String,
        state: String,
        radiusMiles: { type: Number, default: 25 },
      },
    ],
    availability: {
      monday: { start: String, end: String, available: Boolean },
      tuesday: { start: String, end: String, available: Boolean },
      wednesday: { start: String, end: String, available: Boolean },
      thursday: { start: String, end: String, available: Boolean },
      friday: { start: String, end: String, available: Boolean },
      saturday: { start: String, end: String, available: Boolean },
      sunday: { start: String, end: String, available: Boolean },
    },
    blockedSlots: [
      {
        date: Date,
        startTime: String,
        endTime: String,
        reason: String,
      },
    ],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalJobs: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    hourlyRate: { type: Number, min: 0 },
    maxConcurrentJobs: { type: Number, default: 3 },
    currentActiveJobs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

technicianProfileSchema.index({ specializations: 1, isAvailable: 1 });
technicianProfileSchema.index({ 'serviceAreas.zipCode': 1 });
technicianProfileSchema.index({ averageRating: -1 });

technicianProfileSchema.methods.isAvailableAt = function (date, duration) {
  const dayOfWeek = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ][date.getDay()];

  const daySchedule = this.availability[dayOfWeek];
  if (!daySchedule || !daySchedule.available) return false;

  const requestedStart = date.getHours() * 60 + date.getMinutes();
  const requestedEnd = requestedStart + duration;

  const [startH, startM] = daySchedule.start.split(':').map(Number);
  const [endH, endM] = daySchedule.end.split(':').map(Number);
  const schedStart = startH * 60 + startM;
  const schedEnd = endH * 60 + endM;

  if (requestedStart < schedStart || requestedEnd > schedEnd) return false;

  const isBlocked = this.blockedSlots.some((slot) => {
    const slotDate = new Date(slot.date);
    return (
      slotDate.toDateString() === date.toDateString()
    );
  });

  return !isBlocked && this.currentActiveJobs < this.maxConcurrentJobs;
};

module.exports = mongoose.model('TechnicianProfile', technicianProfileSchema);
```

```javascript
// src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'VERIFY_EMAIL',
        'RESET_PASSWORD',
        'ASSIGN_TECHNICIAN',
        'RESCHEDULE',
        'CANCEL',
        'COMPLETE',
        'SEND_NOTIFICATION',
        'PAYMENT_PROCESSED',
        'REFUND_ISSUED',
        'CONFIG_CHANGED',
      ],
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'User',
        'ServiceAppointment',
        'Notification',
        'BillingRecord',
        'TechnicianProfile',
        'SystemConfig',
      ],
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      sessionId: String,
      geoLocation: {
        country: String,
        city: String,
      },
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
  },
  {
    timestamps: true,
    capped: { size: 1073741824, max: 5000000 }, // 1GB cap, 5M docs
  }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // TTL: 1 year

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

```javascript
// src/models/BillingRecord.js
const mongoose = require('mongoose');

const billingRecordSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceAppointment',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountCode: String,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: [
        'draft',
        'pending',
        'paid',
        'partially_paid',
        'overdue',
        'refunded',
        'cancelled',
        'disputed',
      ],
      default: 'draft',
    },
    paymentMethod: {
      type: { type: String, enum: ['card', 'bank_transfer', 'cash', 'check'] },
      last4: String,
      brand: String,
    },
    stripePaymentIntentId: String,
    stripeInvoiceId: String,
    dueDate: Date,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

billingRecordSchema.index({ customer: 1, status: 1 });
billingRecordSchema.index({ appointment: 1 });
billingRecordSchema.index({ invoiceNumber: 1 });
billingRecordSchema.index({ status: 1, dueDate: 1 });

billingRecordSchema.pre('save', function (next) {
  if (this.isModified('lineItems')) {
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);
    this.taxTotal = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    this.totalAmount = this.subtotal + this.taxTotal - this.discountAmount;
  }
  next();
});

module.exports = mongoose.model('BillingRecord', billingRecordSchema);
```

---

## 4. Internal Event Bus Architecture

### 4.1 Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERNAL EVENT BUS                                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     EventEmitter Hub                         │    │
│  │                                                              │    │
│  │  appointment.created ──► NotificationModule                  │    │
│  │                     ──► SchedulingModule                     │    │
│  │                     ──► BillingModule                        │    │
│  │                     ──► AuditModule                          │    │
│  │                                                              │    │
│  │  appointment.confirmed ──► NotificationModule                │    │
│  │                        ──► TechnicianModule                  │    │
│  │                        ──► AuditModule                       │    │
│  │                                                              │    │
│  │  appointment.completed ──► NotificationModule                │    │
│  │                        ──► BillingModule                     │    │
│  │                        ──► ReportingModule                   │    │
│  │                        ──► AuditModule                       │    │
│  │                                                              │    │
│  │  appointment.cancelled ──► NotificationModule                │    │
│  │                        ──► BillingModule                     │    │
│  │                        ──► SchedulingModule                  │    │
│  │                        ──► AuditModule                       │    │
│  │                                                              │    │
│  │  payment.completed ──► NotificationModule                    │    │
│  │                    ──► AuditModule                           │    │
│  │                                                              │    │
│  │  user.registered ──► NotificationModule (Welcome Email)      │    │
│  │                   ──► AuditModule                            │    │
│  │                                                              │    │
│  │  technician.assigned ──► NotificationModule                  │    │
│  │                      ──► SchedulingModule                    │    │
│  │                      ──► AuditModule                         │    │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Event Bus Implementation

```javascript
// src/core/eventBus.js
const EventEmitter = require('events');
const logger = require('../utils/logger');

class ApplicationEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._eventHistory = [];
    this._deadLetterQueue = [];
  }

  publish(eventName, payload) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: eventName,
      payload,
      timestamp: new Date(),
      processed: false,
    };

    logger.info(`Event published: ${eventName}`, {
      eventId: event.id,
      payloadKeys: Object.keys(payload),
    });

    this._eventHistory.push(event);

    // Trim history to last 1000 events
    if (this._eventHistory.length > 1000) {
      this._eventHistory = this._eventHistory.slice(-1000);
    }

    try {
      this.emit(eventName, event);
      event.processed = true;
    } catch (error) {
      logger.error(`Event processing failed: ${eventName}`, {
        eventId: event.id,
        error: error.message,
      });
      this._deadLetterQueue.push({ event, error: error.message });
    }

    return event.id;
  }

  subscribe(eventName, handler, context = 'unknown') {
    const wrappedHandler = async (event) => {
      const startTime = Date.now();
      try {
        await handler(event.payload, event);
        logger.debug(`Event handled: ${eventName} by ${context}`, {
          eventId: event.id,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        logger.error(`Event handler error: ${eventName} in ${context}`, {
          eventId: event.id,
          error: error.message,
          stack: error.stack,
        });
        this._deadLetterQueue.push({
          event,
          error: error.message,
          handler: context,
        });
      }
    };

    this.on(eventName, wrappedHandler);

    logger.info(`Event subscription: ${context} ──► ${eventName}`);

    return () => this.off(eventName, wrappedHandler);
  }

  getDeadLetterQueue() {
    return [...this._deadLetterQueue];
  }

  retryDeadLetters() {
    const retryQueue = [...this._deadLetterQueue];
    this._deadLetterQueue = [];

    retryQueue.forEach((item) => {
      logger.info(`Retrying dead letter event: ${item.event.name}`, {
        eventId: item.event.id,
      });
      this.publish(