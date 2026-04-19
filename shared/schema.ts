

# FixNotify — System Architecture Specification

**Version:** 1.0.0
**Author:** Claude Opus 4.6, System Architect
**Date:** 2024-05-15
**Classification:** Internal — Engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Philosophy & Principles](#2-architectural-philosophy--principles)
3. [High-Level System Architecture](#3-high-level-system-architecture)
4. [Microservices Breakdown](#4-microservices-breakdown)
5. [Database Schema & ERD](#5-database-schema--erd)
6. [API Gateway Design](#6-api-gateway-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Real-Time Communication Layer](#8-real-time-communication-layer)
9. [AI/ML Integration Architecture](#9-aiml-integration-architecture)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Security Architecture](#11-security-architecture)
12. [Scalability & Performance Strategy](#12-scalability--performance-strategy)
13. [Monitoring, Logging & Observability](#13-monitoring-logging--observability)
14. [Disaster Recovery & Data Integrity](#14-disaster-recovery--data-integrity)
15. [Future Enhancement Roadmap](#15-future-enhancement-roadmap)

---

## 1. Executive Summary

FixNotify is a comprehensive fix/issue tracking and notification platform designed to streamline the lifecycle of bug reports, maintenance tasks, and service requests. This document defines a **modular, event-driven microservices architecture** that prioritizes horizontal scalability, security-by-design, developer experience, and extensibility toward advanced AI-driven features.

The system is decomposed into **8 core microservices**, connected via an API Gateway, communicating through both synchronous (REST/gRPC) and asynchronous (event bus) patterns, backed by purpose-optimized data stores, and wrapped in a comprehensive observability layer.

---

## 2. Architectural Philosophy & Principles

### 2.1 Core Principles

| Principle | Description |
|---|---|
| **Domain-Driven Design (DDD)** | Services are bounded by business domains, not technical layers |
| **Event-Driven Architecture** | Loose coupling via asynchronous events for cross-service communication |
| **API-First Design** | All service interfaces defined via OpenAPI 3.1 contracts before implementation |
| **Zero-Trust Security** | Every request authenticated and authorized regardless of origin |
| **Infrastructure as Code** | All infrastructure declaratively defined and version-controlled |
| **12-Factor App Compliance** | Each service adheres to 12-factor methodology |
| **CQRS Where Beneficial** | Command-Query Responsibility Segregation for read-heavy domains |
| **Graceful Degradation** | System remains functional when individual components fail |

### 2.2 Technology Stack Decision Matrix

```
┌──────────────────────┬─────────────────────────────────────────────┐
│ Layer                │ Technology                                  │
├──────────────────────┼─────────────────────────────────────────────┤
│ Frontend             │ Next.js 14 (App Router), TypeScript,        │
│                      │ TailwindCSS, Zustand, React Query           │
├──────────────────────┼─────────────────────────────────────────────┤
│ API Gateway          │ Kong Gateway (OSS) / Custom Node.js Gateway │
├──────────────────────┼─────────────────────────────────────────────┤
│ Core Services        │ Node.js 20 (Express/Fastify), TypeScript    │
├──────────────────────┼─────────────────────────────────────────────┤
│ AI/ML Service        │ Python 3.12, FastAPI, LangChain             │
├──────────────────────┼─────────────────────────────────────────────┤
│ Primary Database     │ PostgreSQL 16                                │
├──────────────────────┼─────────────────────────────────────────────┤
│ Cache Layer          │ Redis 7 (Cluster Mode)                      │
├──────────────────────┼─────────────────────────────────────────────┤
│ Search Engine        │ Elasticsearch 8 / Meilisearch               │
├──────────────────────┼─────────────────────────────────────────────┤
│ Message Broker       │ Apache Kafka / NATS JetStream                │
├──────────────────────┼─────────────────────────────────────────────┤
│ Object Storage       │ MinIO / AWS S3                               │
├──────────────────────┼─────────────────────────────────────────────┤
│ Real-Time            │ Socket.IO / WebSocket (via dedicated svc)    │
├──────────────────────┼─────────────────────────────────────────────┤
│ Containerization     │ Docker, Kubernetes (K8s)                     │
├──────────────────────┼─────────────────────────────────────────────┤
│ CI/CD                │ GitHub Actions, ArgoCD                       │
├──────────────────────┼─────────────────────────────────────────────┤
│ Observability        │ Prometheus, Grafana, Jaeger, ELK Stack       │
└──────────────────────┴─────────────────────────────────────────────┘
```

---

## 3. High-Level System Architecture

### 3.1 Architecture Diagram (ASCII)

```
                          ┌──────────────────────┐
                          │    CDN (CloudFlare)   │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │   Load Balancer (L7)  │
                          │   (NGINX / ALB)       │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                 │
           ┌────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
           │  Next.js SSR   │ │  API Gateway │ │  WebSocket   │
           │  Frontend      │ │  (Kong/Custom│ │  Gateway     │
           │  (Port 3000)   │ │  Port 8000)  │ │  (Port 8080) │
           └────────────────┘ └──────┬───────┘ └──────┬───────┘
                                     │                 │
                    ┌────────────────┼────────────────┐
                    │                │                 │
     ┌──────────────┤    Service Mesh (Istio/Linkerd)  ├──────────┐
     │              │                │                 │          │
     │              │                │                 │          │
┌────▼────┐  ┌──────▼──────┐  ┌─────▼─────┐  ┌───────▼──────┐  │
│  Auth   │  │    Fix      │  │Notification│  │   User       │  │
│ Service │  │  Service    │  │  Service   │  │  Service     │  │
│         │  │             │  │            │  │              │  │
└────┬────┘  └──────┬──────┘  └─────┬─────┘  └───────┬──────┘  │
     │              │               │                 │          │
     │         ┌────▼────┐    ┌─────▼─────┐    ┌─────▼──────┐  │
     │         │ Comment  │    │  Report   │    │    AI      │  │
     │         │ Service  │    │  Service  │    │  Service   │  │
     │         └────┬────┘    └─────┬─────┘    └─────┬──────┘  │
     │              │               │                 │          │
     └──────────────┼───────────────┼─────────────────┘          │
                    │               │                             │
          ┌─────────▼───────────────▼──────────────┐             │
          │           Event Bus (Kafka/NATS)        │◄────────────┘
          └─────────┬───────────────┬──────────────┘
                    │               │
     ┌──────────────┼───────────────┼──────────────┐
     │              │               │              │
┌────▼────┐  ┌──────▼──────┐  ┌────▼────┐  ┌──────▼──────┐
│PostgreSQL│  │    Redis    │  │  Elastic │  │   MinIO     │
│ (Primary)│  │  (Cache)   │  │  Search  │  │  (Storage)  │
└─────────┘  └─────────────┘  └─────────┘  └─────────────┘
```

### 3.2 Communication Patterns

```
┌────────────────────────────────────────────────────────────────┐
│                    Communication Matrix                         │
├─────────────────┬──────────────┬───────────────────────────────┤
│ Pattern          │ Protocol     │ Use Case                     │
├─────────────────┼──────────────┼───────────────────────────────┤
│ Synchronous      │ REST/HTTP    │ Client ↔ API Gateway         │
│ Synchronous      │ gRPC         │ Inter-service (low latency)  │
│ Asynchronous     │ Kafka Events │ Cross-domain side effects    │
│ Real-Time        │ WebSocket    │ Live notifications, updates  │
│ Request-Reply    │ NATS         │ Short-lived service queries  │
└─────────────────┴──────────────┴───────────────────────────────┘
```

---

## 4. Microservices Breakdown

### 4.1 Service Inventory

```
┌─────┬────────────────────┬──────────────────────────────────────────┐
│  #  │ Service Name       │ Responsibility                           │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  1  │ auth-service       │ Authentication, authorization, session   │
│     │                    │ management, OAuth2, JWT lifecycle        │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  2  │ user-service       │ User profiles, preferences, teams,      │
│     │                    │ roles, organization management           │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  3  │ fix-service        │ Core CRUD for fixes/issues, status      │
│     │                    │ transitions, tagging, assignment logic   │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  4  │ comment-service    │ Threaded comments, mentions, reactions,  │
│     │                    │ activity log on fixes                    │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  5  │ notification-svc   │ Multi-channel notifications (in-app,    │
│     │                    │ email, push, Slack/webhook)              │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  6  │ report-service     │ Analytics, dashboards, data aggregation,│
│     │                    │ scheduled report generation              │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  7  │ ai-service         │ NLP analysis, auto-categorization,      │
│     │                    │ duplicate detection, smart suggestions   │
├─────┼────────────────────┼──────────────────────────────────────────┤
│  8  │ file-service       │ Attachment uploads, processing,         │
│     │                    │ virus scanning, CDN integration          │
└─────┴────────────────────┴──────────────────────────────────────────┘
```

### 4.2 Detailed Service Specifications

#### 4.2.1 Auth Service

```typescript
// Service: auth-service
// Port: 4001
// Database: PostgreSQL (auth_db)
// Cache: Redis (sessions, token blacklist)

/**
 * Endpoints:
 * POST   /auth/register          → User registration
 * POST   /auth/login             → Email/password login
 * POST   /auth/login/oauth       → OAuth2 login (Google, GitHub)
 * POST   /auth/refresh           → Refresh access token
 * POST   /auth/logout            → Invalidate session
 * POST   /auth/forgot-password   → Initiate password reset
 * POST   /auth/reset-password    → Complete password reset
 * POST   /auth/verify-email      → Email verification
 * GET    /auth/me                → Current user context
 * POST   /auth/mfa/setup         → Enable MFA (TOTP)
 * POST   /auth/mfa/verify        → Verify MFA code
 *
 * Events Published:
 * - user.registered
 * - user.logged_in
 * - user.password_reset
 * - user.mfa_enabled
 *
 * Events Consumed:
 * - user.deleted (from user-service → cleanup sessions)
 */

// Token Strategy
interface TokenConfig {
  accessToken: {
    type: 'JWT';
    algorithm: 'RS256';
    expiresIn: '15m';
    payload: {
      sub: string;        // user ID
      email: string;
      roles: string[];
      orgId: string;
      permissions: string[];
    };
  };
  refreshToken: {
    type: 'opaque';
    storage: 'redis';
    expiresIn: '7d';
    rotation: true;       // single-use refresh tokens
  };
}
```

#### 4.2.2 Fix Service (Core Domain)

```typescript
// Service: fix-service
// Port: 4003
// Database: PostgreSQL (fix_db)
// Search: Elasticsearch (fix_index)
// Cache: Redis (hot fixes, counters)

/**
 * Endpoints:
 * POST   /fixes                     → Create new fix
 * GET    /fixes                     → List fixes (paginated, filtered)
 * GET    /fixes/:id                 → Get fix detail
 * PATCH  /fixes/:id                 → Update fix fields
 * DELETE /fixes/:id                 → Soft-delete fix
 * POST   /fixes/:id/assign          → Assign fix to user(s)
 * PATCH  /fixes/:id/status          → Transition fix status
 * POST   /fixes/:id/tags            → Add/remove tags
 * GET    /fixes/:id/history         → Get audit trail
 * GET    /fixes/:id/related         → AI-powered related fixes
 * POST   /fixes/bulk                → Bulk operations
 * GET    /fixes/search              → Full-text search (Elastic)
 *
 * Events Published:
 * - fix.created
 * - fix.updated
 * - fix.status_changed
 * - fix.assigned
 * - fix.deleted
 * - fix.commented (relayed from comment-service)
 *
 * Events Consumed:
 * - user.deleted → reassign/archive fixes
 * - ai.classification_complete → update fix metadata
 * - comment.created → update fix activity timestamp
 */

// Fix Status State Machine
enum FixStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  WONT_FIX = 'wont_fix'
}

// Valid Status Transitions
const STATUS_TRANSITIONS: Record<FixStatus, FixStatus[]> = {
  [FixStatus.DRAFT]:       [FixStatus.OPEN],
  [FixStatus.OPEN]:        [FixStatus.IN_PROGRESS, FixStatus.WONT_FIX, FixStatus.CLOSED],
  [FixStatus.IN_PROGRESS]: [FixStatus.IN_REVIEW, FixStatus.OPEN, FixStatus.RESOLVED],
  [FixStatus.IN_REVIEW]:   [FixStatus.IN_PROGRESS, FixStatus.RESOLVED],
  [FixStatus.RESOLVED]:    [FixStatus.CLOSED, FixStatus.REOPENED],
  [FixStatus.CLOSED]:      [FixStatus.REOPENED],
  [FixStatus.REOPENED]:    [FixStatus.IN_PROGRESS, FixStatus.CLOSED],
  [FixStatus.WONT_FIX]:    [FixStatus.REOPENED],
};
```

#### 4.2.3 Notification Service

```typescript
// Service: notification-service
// Port: 4005
// Database: PostgreSQL (notification_db)
// Queue: Kafka (notification_events topic)
// Cache: Redis (user preferences, rate limiting)

/**
 * Endpoints:
 * GET    /notifications              → List user notifications
 * PATCH  /notifications/:id/read     → Mark as read
 * POST   /notifications/read-all     → Mark all as read
 * DELETE /notifications/:id          → Delete notification
 * GET    /notifications/preferences  → Get notification preferences
 * PUT    /notifications/preferences  → Update preferences
 * GET    /notifications/unread-count → Get unread count (cached)
 *
 * Events Consumed:
 * - fix.created         → Notify team members
 * - fix.assigned        → Notify assignee
 * - fix.status_changed  → Notify watchers
 * - comment.created     → Notify fix participants
 * - comment.mentioned   → Notify mentioned users
 * - report.generated    → Notify requester
 *
 * Notification Channels:
 * - In-App (WebSocket push)
 * - Email (via SendGrid/SES)
 * - Push Notifications (FCM/APNs)
 * - Webhooks (Slack, Discord, custom)
 */

// Notification Priority & Rate Limiting
interface NotificationPolicy {
  channels: ('in_app' | 'email' | 'push' | 'webhook')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  rateLimits: {
    email: { max: 50, window: '1h' };
    push: { max: 100, window: '1h' };
    webhook: { max: 200, window: '1h' };
  };
  batching: {
    enabled: boolean;
    interval: '5m' | '15m' | '1h';
    maxBatchSize: 20;
  };
}
```

---

## 5. Database Schema & ERD

### 5.1 Entity Relationship Diagram (ASCII)

```
┌─────────────────────┐      ┌─────────────────────────┐
│    organizations     │      │       users              │
├─────────────────────┤      ├─────────────────────────┤
│ id (PK, UUID)       │◄──┐  │ id (PK, UUID)           │
│ name                │   │  │ org_id (FK) ─────────────┼──►
│ slug                │   │  │ email (UNIQUE)           │
│ plan_tier           │   │  │ password_hash            │
│ settings (JSONB)    │   │  │ display_name             │
│ created_at          │   │  │ avatar_url               │
│ updated_at          │   │  │ role                     │
└─────────────────────┘   │  │ status (active/suspended)│
                          │  │ mfa_enabled              │
                          │  │ preferences (JSONB)      │
                          │  │ last_login_at            │
                          │  │ created_at               │
                          │  │ updated_at               │
                          │  └──────────┬──────────────┘
                          │             │
                          │             │ 1:N
                          │             │
┌─────────────────────┐   │  ┌──────────▼──────────────┐
│    tags             │   │  │       fixes              │
├─────────────────────┤   │  ├─────────────────────────┤
│ id (PK, UUID)       │   │  │ id (PK, UUID)           │
│ org_id (FK)─────────┼───┤  │ org_id (FK)─────────────┼──►
│ name                │   │  │ fix_number (SERIAL, org) │
│ color               │   │  │ title                    │
│ created_at          │   │  │ description (TEXT)       │
└────────┬────────────┘   │  │ status (ENUM)            │
         │                │  │ priority (ENUM)          │
         │ M:N            │  │ severity (ENUM)          │
         │                │  │ category                  │
┌────────▼────────────┐   │  │ creator_id (FK users)    │
│    fix_tags         │   │  │ due_date                  │
├─────────────────────┤   │  │ resolved_at               │
│ fix_id (FK)         │   │  │ closed_at                 │
│ tag_id (FK)         │   │  │ environment               │
│ (composite PK)      │   │  │ metadata (JSONB)          │
└─────────────────────┘   │  │ ai_classification (JSONB) │
                          │  │ search_vector (tsvector)   │
                          │  │ created_at                 │
                          │  │ updated_at                 │
                          │  │ deleted_at (soft delete)   │
                          │  └──────────┬──────────────┘
                          │             │
                          │             │ 1:N
                          │             │
                          │  ┌──────────▼──────────────┐
                          │  │    fix_assignments       │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ fix_id (FK fixes)       │
                          │  │ user_id (FK users)      │
                          │  │ assigned_by (FK users)  │
                          │  │ assigned_at             │
                          │  │ (UNIQUE: fix_id+user_id)│
                          │  └─────────────────────────┘
                          │
                          │  ┌─────────────────────────┐
                          │  │      comments            │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ fix_id (FK fixes)       │
                          │  │ author_id (FK users)    │
                          │  │ parent_id (FK comments) │ ← threading
                          │  │ body (TEXT)              │
                          │  │ body_html (TEXT)         │
                          │  │ is_internal (BOOLEAN)    │
                          │  │ edited_at                │
                          │  │ created_at               │
                          │  │ updated_at               │
                          │  │ deleted_at               │
                          │  └──────────┬──────────────┘
                          │             │
                          │             │ 1:N
                          │             │
                          │  ┌──────────▼──────────────┐
                          │  │   comment_mentions       │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ comment_id (FK)         │
                          │  │ mentioned_user_id (FK)  │
                          │  │ created_at              │
                          │  └─────────────────────────┘
                          │
                          │  ┌─────────────────────────┐
                          │  │    notifications         │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ user_id (FK users)      │
                          │  │ type (ENUM)              │
                          │  │ title                    │
                          │  │ body                     │
                          │  │ data (JSONB)             │
                          │  │ read_at                  │
                          │  │ channel (ENUM)           │
                          │  │ delivered_at             │
                          │  │ created_at               │
                          │  └─────────────────────────┘
                          │
                          │  ┌─────────────────────────┐
                          │  │    fix_history           │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ fix_id (FK fixes)       │
                          │  │ actor_id (FK users)     │
                          │  │ action (ENUM)            │
                          │  │ field_name               │
                          │  │ old_value (JSONB)        │
                          │  │ new_value (JSONB)        │
                          │  │ created_at               │
                          │  └─────────────────────────┘
                          │
                          │  ┌─────────────────────────┐
                          │  │    attachments           │
                          │  ├─────────────────────────┤
                          │  │ id (PK, UUID)           │
                          │  │ fix_id (FK fixes)       │
                          │  │ comment_id (FK, NULL)   │
                          │  │ uploader_id (FK users)  │
                          │  │ filename                 │
                          │  │ mime_type                │
                          │  │ size_bytes               │
                          │  │ storage_key              │
                          │  │ scan_status (ENUM)       │
                          │  │ created_at               │
                          └──┴─────────────────────────┘
```

### 5.2 Database Design Details

```sql
-- ============================================================
-- SCHEMA: auth_db (Auth Service)
-- ============================================================

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    refresh_token   VARCHAR(512) NOT NULL UNIQUE,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE revoked_at IS NULL;

-- ============================================================
-- SCHEMA: fix_db (Fix Service - Core)
-- ============================================================

-- Enums
CREATE TYPE fix_status AS ENUM (
    'draft', 'open', 'in_progress', 'in_review',
    'resolved', 'closed', 'reopened', 'wont_fix'
);

CREATE TYPE fix_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE fix_severity AS ENUM ('blocker', 'major', 'minor', 'trivial');

-- Core Fixes Table
CREATE TABLE fixes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL,
    fix_number          INTEGER NOT NULL,
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    status              fix_status NOT NULL DEFAULT 'open',
    priority            fix_priority NOT NULL DEFAULT 'medium',
    severity            fix_severity DEFAULT 'minor',
    category            VARCHAR(100),
    creator_id          UUID NOT NULL,
    due_date            DATE,
    resolved_at         TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    environment         VARCHAR(50),
    metadata            JSONB DEFAULT '{}',
    ai_classification   JSONB DEFAULT '{}',
    search_vector       tsvector,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT uq_org_fix_number UNIQUE (org_id, fix_number)
);

-- Performance Indexes
CREATE INDEX idx_fixes_org_status ON fixes(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_fixes_creator ON fixes(creator_id);
CREATE INDEX idx_fixes_priority ON fixes(priority, created_at DESC);
CREATE INDEX idx_fixes_due_date ON fixes(due_date) WHERE due_date IS NOT NULL AND status NOT IN ('closed', 'resolved');
CREATE INDEX idx_fixes_search ON fixes USING GIN(search_vector);
CREATE INDEX idx_fixes_metadata ON fixes USING GIN(metadata jsonb_path_ops);
CREATE INDEX idx_fixes_created_at ON fixes(created_at DESC);

-- Auto-update search vector trigger
CREATE FUNCTION fixes_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fixes_search_vector
    BEFORE INSERT OR UPDATE OF title, description, category
    ON fixes
    FOR EACH ROW
    EXECUTE FUNCTION fixes_search_vector_update();

-- Auto-increment fix_number per org
CREATE FUNCTION next_fix_number(p_org_id UUID) RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(fix_number), 0) + 1
    INTO next_num
    FROM fixes
    WHERE org_id = p_org_id;
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Fix History / Audit Trail
CREATE TABLE fix_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fix_id      UUID NOT NULL REFERENCES fixes(id),
    actor_id    UUID NOT NULL,
    action      VARCHAR(50) NOT NULL,
    field_name  VARCHAR(100),
    old_value   JSONB,
    new_value   JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fix_history_fix ON fix_history(fix_id, created_at DESC);

-- ============================================================
-- SCHEMA: notification_db (Notification Service)
-- ============================================================

CREATE TYPE notification_type AS ENUM (
    'fix_assigned', 'fix_status_changed', 'fix_commented',
    'fix_mentioned', 'fix_due_soon', 'report_ready',
    'system_announcement'
);

CREATE TYPE notification_channel AS ENUM (
    'in_app', 'email', 'push', 'webhook'
);

CREATE TABLE