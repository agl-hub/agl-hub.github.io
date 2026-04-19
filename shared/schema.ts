# FixNotify Enhanced — Architectural Specification Document


# FixNotify — System Architecture Specification

**Version:** 1.0.0
**Author:** Claude Opus 4.6, System Architect
**Date:** January 2025
**Status:** Living Document — Approved for Implementation
**Date:** 2024-05-15
**Classification:** Internal — Engineering

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview & Design Philosophy](#2-system-overview--design-philosophy)
3. [High-Level Architecture](#3-high-level-architecture)
2. [Architectural Philosophy & Principles](#2-architectural-philosophy--principles)
3. [High-Level System Architecture](#3-high-level-system-architecture)
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

FixNotify Enhanced is a multi-tenant issue reporting and civic notification platform enabling citizens to report infrastructure problems (potholes, broken streetlights, graffiti, etc.), track resolution progress, and receive intelligent notifications. The system extends a basic FixNotify clone with AI-powered categorization, predictive maintenance, real-time collaboration, and advanced analytics.

### Key Design Objectives
FixNotify is a comprehensive fix/issue tracking and notification platform designed to streamline the lifecycle of bug reports, maintenance tasks, and service requests. This document defines a **modular, event-driven microservices architecture** that prioritizes horizontal scalability, security-by-design, developer experience, and extensibility toward advanced AI-driven features.

| Objective | Target |
|-----------|--------|
| Availability | 99.95% uptime (≤ 22 min/month downtime) |
| Latency (P95) | < 200ms for API responses |
| Throughput | 10,000 concurrent users, 500 req/s sustained |
| Data Durability | 99.999999999% (11 nines) |
| Time-to-Recovery | RTO: 15 min, RPO: 1 min |
| Scale Ceiling | 50M reports/year, 1M registered users |
The system is decomposed into **8 core microservices**, connected via an API Gateway, communicating through both synchronous (REST/gRPC) and asynchronous (event bus) patterns, backed by purpose-optimized data stores, and wrapped in a comprehensive observability layer.

---

## 2. System Overview & Design Philosophy
## 2. Architectural Philosophy & Principles

### 2.1 Architectural Principles
### 2.1 Core Principles

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

### 2.2 Bounded Contexts (Domain-Driven Design)
### 2.2 Technology Stack Decision Matrix

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

## 3. High-Level Architecture
## 3. High-Level System Architecture

### 3.1 System Architecture Diagram
### 3.1 Architecture Diagram (ASCII)

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

### 3.2 Network Topology
### 3.2 Communication Patterns

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
@@ -296,140 +164,468 @@ Legend:  ───▶  Upstream/Downstream dependency
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

### 4.2 Service Interaction Diagram
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

### 4.3 Detailed Service Specifications
---

## 5. Database Schema & ERD

#### 4.3.1 Identity Service
### 5.1 Entity Relationship Diagram (ASCII)

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
