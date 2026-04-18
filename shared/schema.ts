# FixNotify Enhanced — Architectural Specification Document

**Version:** 1.0.0
**Author:** Claude Opus 4.6, System Architect
**Date:** January 2025
**Status:** Living Document — Approved for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Design Philosophy](#2-system-overview--design-philosophy)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Microservices Breakdown](#4-microservices-breakdown)
5. [Database Schema & ERD](#5-database-schema--erd)
6. [API Gateway Design](#6-api-gateway-design)
7. [Event-Driven Architecture](#7-event-driven-architecture)
8. [Security Architecture](#8-security-architecture)
9. [AI/ML Pipeline Architecture](#9-aiml-pipeline-architecture)
10. [Infrastructure & Deployment](#10-infrastructure--deployment)
11. [Scalability Strategy](#11-scalability-strategy)
12. [Observability & Monitoring](#12-observability--monitoring)
13. [Disaster Recovery & Business Continuity](#13-disaster-recovery--business-continuity)
14. [Future Enhancement Roadmap](#14-future-enhancement-roadmap)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

FixNotify Enhanced is a multi-tenant issue reporting and civic notification platform enabling citizens to report infrastructure problems (potholes, broken streetlights, graffiti, etc.), track resolution progress, and receive intelligent notifications. The system extends a basic FixNotify clone with AI-powered categorization, predictive maintenance, real-time collaboration, and advanced analytics.

### Key Design Objectives

| Objective | Target |
|-----------|--------|
| Availability | 99.95% uptime (≤ 22 min/month downtime) |
| Latency (P95) | < 200ms for API responses |
| Throughput | 10,000 concurrent users, 500 req/s sustained |
| Data Durability | 99.999999999% (11 nines) |
| Time-to-Recovery | RTO: 15 min, RPO: 1 min |
| Scale Ceiling | 50M reports/year, 1M registered users |

---

## 2. System Overview & Design Philosophy

### 2.1 Architectural Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN PRINCIPLES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Domain-Driven Design (DDD)                                  │
│     → Bounded contexts align with business capabilities         │
│                                                                 │
│  2. Event Sourcing for Core Domains                             │
│     → Complete audit trail, temporal queries, replay            │
│                                                                 │
│  3. CQRS (Command Query Responsibility Segregation)             │
│     → Separate read/write models for performance                │
│                                                                 │
│  4. Zero-Trust Security                                         │
│     → Never trust, always verify, least privilege               │
│                                                                 │
│  5. API-First Design                                            │
│     → OpenAPI 3.1 contracts before implementation               │
│                                                                 │
│  6. Twelve-Factor App Compliance                                │
│     → Cloud-native, portable, scalable                          │
│                                                                 │
│  7. Graceful Degradation                                        │
│     → Core functionality survives component failures            │
│                                                                 │
│  8. Data Sovereignty & Privacy by Design                        │
│     → GDPR/CCPA compliance baked into architecture              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Bounded Contexts (Domain-Driven Design)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     BOUNDED CONTEXT MAP                              │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐          │
│  │   Identity   │───▶│   Reporting  │───▶│  Resolution   │          │
│  │   Context    │    │   Context    │    │   Context     │          │
│  │              │    │              │    │               │          │
│  │ • Users      │    │ • Issues     │    │ • Assignments │          │
│  │ • Orgs       │    │ • Categories │    │ • Workflows   │          │
│  │ • Roles      │    │ • Media      │    │ • SLAs        │          │
│  │ • Auth       │    │ • Locations  │    │ • Comments    │          │
│  └──────┬───────┘    └──────┬───────┘    └───────┬───────┘          │
│         │                   │                    │                   │
│         │            ┌──────▼───────┐            │                   │
│         │            │ Notification │◀───────────┘                   │
│         └───────────▶│   Context    │                                │
│                      │              │    ┌───────────────┐           │
│                      │ • Channels   │    │  Analytics    │           │
│                      │ • Templates  │───▶│  Context      │           │
│                      │ • Prefs      │    │               │           │
│                      │ • Delivery   │    │ • Metrics     │           │
│                      └──────────────┘    │ • Reports     │           │
│                                          │ • Predictions │           │
│  ┌──────────────┐    ┌──────────────┐    │ • Dashboards  │           │
│  │     AI       │───▶│   Geospatial │    └───────────────┘           │
│  │   Context    │    │   Context    │                                │
│  │              │    │              │                                │
│  │ • Classify   │    │ • Maps       │                                │
│  │ • Predict    │    │ • Zones      │                                │
│  │ • NLP        │    │ • Routing    │                                │
│  │ • Vision     │    │ • Geocoding  │                                │
│  └──────────────┘    └──────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘

Legend:  ───▶  Upstream/Downstream dependency
        Context boundaries enforce data ownership
```

---

## 3. High-Level Architecture

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
│                                                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  React  │  │ React   │  │  Mobile  │  │  3rd Party│  │   IoT       │  │
│  │  SPA    │  │ Native  │  │  PWA     │  │  Webhooks │  │   Sensors   │  │
│  │(Citizen)│  │  Apps   │  │         │  │           │  │             │  │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
│       │            │            │              │               │          │
└───────┼────────────┼────────────┼──────────────┼───────────────┼──────────┘
        │            │            │              │               │
        └────────────┴────────────┴──────┬───────┴───────────────┘
                                         │
                                    ┌────▼─────┐
                                    │   CDN    │  (CloudFront/Fastly)
                                    │  + WAF   │
                                    └────┬─────┘
                                         │
                              ┌──────────▼──────────┐
                              │    LOAD BALANCER     │  (ALB / NLB)
                              │   (Layer 7 / TLS)   │
                              └──────────┬──────────┘
                                         │
┌────────────────────────────────────────┼────────────────────────────────────┐
│                              API LAYER │                                    │
│                                        │                                    │
│  ┌─────────────────────────────────────▼──────────────────────────────┐    │
│  │                      API GATEWAY (Kong/AWS API GW)                 │    │
│  │                                                                     │    │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │  Rate    │ │  Auth     │ │ Request  │ │  API     │ │ Circuit│ │    │
│  │  │  Limiter │ │  (JWT +   │ │ Validator│ │ Version  │ │ Breaker│ │    │
│  │  │          │ │  OAuth2)  │ │ (Schema) │ │ Router   │ │        │ │    │
│  │  └──────────┘ └───────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  └─────────┬───────────┬──────────┬──────────┬──────────┬────────────┘    │
│            │           │          │          │          │                   │
│  ┌─────────▼──┐  ┌─────▼────┐ ┌──▼─────┐ ┌─▼────────┐│  ┌────────────┐  │
│  │  GraphQL   │  │  REST    │ │  gRPC  │ │ WebSocket ││  │  Async     │  │
│  │  Gateway   │  │  APIs    │ │  (Int) │ │  Gateway  ││  │  Ingress   │  │
│  │  (Apollo)  │  │  v1/v2   │ │        │ │           ││  │  (Webhook) │  │
│  └─────┬──────┘  └────┬─────┘ └───┬────┘ └────┬─────┘│  └─────┬──────┘  │
│        │              │           │           │      │        │          │
└────────┼──────────────┼───────────┼───────────┼──────┼────────┼──────────┘
         │              │           │           │      │        │
         └──────────────┴───────────┴─────┬─────┴──────┘        │
                                          │                     │
┌─────────────────────────────────────────┼─────────────────────┼──────────┐
│                         SERVICE MESH    │  (Istio/Linkerd)    │          │
│                                         │                     │          │
│  ┌─────────────┐  ┌─────────────┐  ┌───▼─────────┐  ┌───────▼───────┐  │
│  │  Identity   │  │  Issue      │  │  Resolution │  │  Notification │  │
│  │  Service    │  │  Service    │  │  Service    │  │  Service      │  │
│  │             │  │             │  │             │  │               │  │
│  │  Port:3001  │  │  Port:3002  │  │  Port:3003  │  │  Port:3004    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘  │
│         │                │                │                  │          │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌───────┴───────┐  │
│  │  Media      │  │  Geospatial │  │  Analytics  │  │  AI/ML        │  │
│  │  Service    │  │  Service    │  │  Service    │  │  Service      │  │
│  │             │  │             │  │             │  │               │  │
│  │  Port:3005  │  │  Port:3006  │  │  Port:3007  │  │  Port:3008    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘  │
│         │                │                │                  │          │
│  ┌──────┴──────┐  ┌──────┴──────────────────────────────────┴───────┐  │
│  │  Workflow   │  │                SAGA ORCHESTRATOR                 │  │
│  │  Engine     │  │              (Temporal / Conductor)              │  │
│  │  Port:3009  │  └─────────────────────────────────────────────────┘  │
│  └─────────────┘                                                       │
│                                                                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                    EVENT BUS &    │  MESSAGE BROKER                     │
│                                   │                                     │
│  ┌────────────────────────────────▼────────────────────────────────┐   │
│  │              Apache Kafka / Amazon EventBridge                   │   │
│  │                                                                  │   │
│  │  Topics:                                                         │   │
│  │  ├── issue.created    ├── issue.updated    ├── issue.resolved   │   │
│  │  ├── user.registered  ├── user.verified    ├── assignment.made  │   │
│  │  ├── notification.send├── media.processed  ├── ai.classified    │   │
│  │  ├── sla.breached     ├── analytics.event  ├── geo.updated      │   │
│  │  └── workflow.step    └── audit.log        └── system.health    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Redis Streams   │  │  Dead Letter     │  │  Schema Registry     │  │
│  │  (Real-time)     │  │  Queue (DLQ)     │  │  (Avro/Protobuf)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                    DATA LAYER     │                                     │
│                                   │                                     │
│  ┌────────────┐  ┌────────────┐  ┌▼───────────┐  ┌──────────────────┐ │
│  │ PostgreSQL │  │ PostgreSQL │  │   Redis    │  │   Elasticsearch  │ │
│  │  (Primary) │  │ (Read      │  │  Cluster   │  │   (Search &      │ │
│  │            │  │  Replicas) │  │            │  │    Analytics)    │ │
│  │ • Issues   │  │            │  │ • Sessions │  │                  │ │
│  │ • Users    │  │ • Queries  │  │ • Cache    │  │ • Full-text      │ │
│  │ • Events   │  │ • Reports  │  │ • Pub/Sub  │  │ • Geo queries    │ │
│  │ • Tenants  │  │ • Analytics│  │ • Rate Lim │  │ • Aggregations   │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────────┘ │
│                                                                        │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌────────────────┐ │
│  │  PostGIS   │  │ Amazon S3  │  │ TimescaleDB │  │  Vector DB     │ │
│  │ (Geospatial│  │ / Minio    │  │ (Time-series│  │  (pgvector /   │ │
│  │  Extension)│  │            │  │  metrics)   │  │   Pinecone)    │ │
│  │            │  │ • Images   │  │             │  │                │ │
│  │ • Geometry │  │ • Videos   │  │ • IoT data  │  │ • Embeddings   │ │
│  │ • Spatial  │  │ • Documents│  │ • SLA track │  │ • Similarity   │ │
│  │   Indexes  │  │ • Backups  │  │ • Perf mon  │  │   Search       │ │
│  └────────────┘  └────────────┘  └─────────────┘  └────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Network Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VPC: 10.0.0.0/16                             │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PUBLIC SUBNET: 10.0.1.0/24          AZ-a                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │  │
│  │  │   ALB    │  │   NAT    │  │  Bastion │                   │  │
│  │  │          │  │  Gateway │  │   Host   │                   │  │
│  │  └──────────┘  └──────────┘  └──────────┘                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PRIVATE SUBNET (App): 10.0.10.0/24  AZ-a                   │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  EKS/ECS Cluster                                     │    │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │  │
│  │  │  │ Identity│ │  Issue  │ │  Notif  │ │   AI    │   │    │  │
│  │  │  │  Pods   │ │  Pods   │ │  Pods   │ │  Pods   │   │    │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │  │
│  │  │  │  Geo    │ │ Resolve │ │ Analytic│ │  Media  │   │    │  │
│  │  │  │  Pods   │ │  Pods   │ │  Pods   │ │  Pods   │   │    │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PRIVATE SUBNET (Data): 10.0.20.0/24  AZ-a + AZ-b           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │  │
│  │  │PostgreSQL│ │  Redis   │ │  Kafka   │ │Elasticsearch │    │  │
│  │  │ Primary  │ │ Primary  │ │ Broker-1 │ │   Node-1     │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │  │
│  │  │PostgreSQL│ │  Redis   │ │  Kafka   │ │Elasticsearch │    │  │
│  │  │ Replica  │ │ Replica  │ │ Broker-2 │ │   Node-2     │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Microservices Breakdown

### 4.1 Service Inventory

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SERVICE CATALOG                                   │
├──────────────┬──────────┬──────────────┬──────────────┬─────────────────┤
│   Service    │  Tech    │   Database   │  Event Bus   │   Criticality   │
├──────────────┼──────────┼──────────────┼──────────────┼─────────────────┤
│ Identity     │ Node/TS  │ PostgreSQL   │ Producer     │ ██████ Critical │
│ Issue        │ Node/TS  │ PG + PostGIS │ Prod+Cons    │ ██████ Critical │
│ Resolution   │ Node/TS  │ PostgreSQL   │ Prod+Cons    │ █████░ High     │
│ Notification │ Node/TS  │ PG + Redis   │ Consumer     │ █████░ High     │
│ Media        │ Node/TS  │ S3 + PG      │ Prod+Cons    │ ████░░ Medium  │
│ Geospatial   │ Python   │ PostGIS + ES │ Prod+Cons    │ ████░░ Medium  │
│ Analytics    │ Python   │ TimescaleDB  │ Consumer     │ ███░░░ Low     │
│ AI/ML        │ Python   │ VectorDB+PG  │ Prod+Cons    │ ███░░░ Low     │
│ Workflow     │ Node/TS  │ PostgreSQL   │ Prod+Cons    │ █████░ High     │
│ API Gateway  │ Kong     │ —            │ —            │ ██████ Critical │
└──────────────┴──────────┴──────────────┴──────────────┴─────────────────┘
```

### 4.2 Service Interaction Diagram

```
                           ┌──────────────────┐
                           │   API Gateway    │
                           └────────┬─────────┘
                                    │
              ┌─────────┬───────────┼───────────┬──────────┐
              │         │           │           │          │
        ┌─────▼───┐ ┌───▼─────┐ ┌──▼──────┐ ┌─▼────────┐│ ┌──────────┐
        │Identity │ │  Issue  │ │Resolut. │ │  Notif.  ││ │  Media   │
        │Service  │ │ Service │ │Service  │ │ Service  ││ │ Service  │
        └────┬────┘ └───┬─────┘ └────┬────┘ └────┬─────┘│ └────┬─────┘
             │          │            │           │      │      │
             │     ┌────▼────┐       │           │      │      │
             │     │Geospatl.│       │           │      │      │
             │     │Service  │       │           │      │      │
             │     └────┬────┘       │           │      │      │
             │          │            │           │      │      │
        ─────┴──────────┴────────────┴───────────┴──────┴──────┴─────
        ░░░░░░░░░░░░░░░░░░░  EVENT BUS (Kafka)  ░░░░░░░░░░░░░░░░░░░
        ─────┬──────────┬────────────┬───────────┬──────┬──────┬─────
             │          │            │           │      │      │
        ┌────▼────┐ ┌───▼─────┐ ┌───▼────┐ ┌───▼────┐ │ ┌────▼─────┐
        │Analytics│ │  AI/ML  │ │Workflow│ │  Audit │ │ │  Search  │
        │Service  │ │ Service │ │Engine  │ │  Log   │ │ │  Index   │
        └─────────┘ └─────────┘ └────────┘ └────────┘ │ └──────────┘
                                                       │
                                               ┌───────▼────────┐
                                               │    SAGA        │
                                               │  Orchestrator  │
                                               │  (Temporal)    │
                                               └────────────────┘
```

### 4.3 Detailed Service Specifications

#### 4.3.1 Identity Service

```
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY SERVICE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Responsibilities:                                          │
│  • User registration & lifecycle management                 │
│  • Authentication (OAuth2 + OIDC + MFA)                     │
│  • Authorization (RBAC + ABAC)                              │
│  • Organization/Tenant management                           │
│  • API key management                                       │
│  • Session management                                       │
│                                                             │
│  API Endpoints:                                             │
│  POST   /auth/register                                      │
│  POST   /auth/login                                         │
│  POST   /auth/refresh                                       │
│  POST   /auth/logout                                        │
│  POST   /auth/mfa/enable                                    │
│  POST   /auth/mfa/verify                                    │
│  POST   /auth/password/reset                                │
│  GET    /users/:id                                          │
│  PUT    /users/:id                                          │
│  DELETE /users/:id        (GDPR right-to-erasure)           │
│  GET    /users/:id/profile                                  │
│  PUT    /users/:id/preferences                              │
│  POST   /organizations                                      │
│  GET    /organizations/:id/members                          │
│  POST   /organizations/:id/invite                           │
│  GET    /roles                                              │
│  POST   /roles                                              │
│  PUT    /roles/:id/permissions                              │
│  POST   /api-keys                                           │
│  DELETE /api-keys/:id                                       │
│                                                             │
│  Events Produced:                                           │
│  • user.registered                                          │
│  • user.verified                                            │
│  • user.profile_updated                                     │
│  • user.deleted (GDPR)                                      │
│  • org.created                                              │
│  • role.assigned                                            │
│                                                             │
│  Tech Stack:                                                │
│  • Node.js + TypeScript + Fastify                           │
│  • PostgreSQL (users, orgs, roles)                          │
│  • Redis (sessions, rate limiting, token blacklist)         │
│  • bcrypt + argon2 (password hashing)                       │
│  • jose (JWT handling)                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.2 Issue Service

```
┌─────────────────────────────────────────────────────────────┐
│                      ISSUE SERVICE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Responsibilities:                                          │
│  • Issue CRUD with event sourcing                           │
│  • Category management (hierarchical)                       │
│  • Status lifecycle management                              │
│  • Issue deduplication (AI-assisted)                        │
│  • Voting/upvoting on issues                                │
│  • Location association                                     │
│                                                             │
│  API Endpoints:                                             │
│  POST   /issues                                             │
│  GET    /issues/:id                                         │
│  PUT    /issues/:id                                         │
│  PATCH  /issues/:id/status                                  │
│  DELETE /issues/:id                                         │
│  GET    /issues                    (paginated, filtered)    │
│  GET    /issues/search             (full-text + geo)        │
│  GET    /issues/nearby             (geo-radius query)       │
│  POST   /issues/:id/vote                                    │
│  DELETE /issues/:id/vote                                    │
│  GET    /issues