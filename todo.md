# AGL Command Center - Project TODO

## Phase 1: Core Dashboard Infrastructure
- [ ] Set up database schema for operational data (sales, workshop, staff, finance)
- [ ] Implement Google Sheets data sync service (fetch and parse Excel data)
- [ ] Create tRPC procedures for data fetching and caching
- [ ] Build dashboard layout with sidebar navigation and responsive design
- [ ] Implement dark theme with red accent colors (preserve existing style)

## Phase 2: KPI & Summary Cards
- [ ] Create KPI card components (revenue, transactions, vehicles serviced, net position)
- [ ] Implement real-time KPI calculations from synced data
- [ ] Add monthly summary display with auto-calculated metrics
- [ ] Build financial overview cards (revenue, expenses, net position)

## Phase 3: Sales & Customer Management
- [ ] Build sales transaction log table with real-time data display
- [ ] Implement filtering by channel (Walk-In, WhatsApp, Phone, Instagram, TikTok, Boss)
- [ ] Add payment method filtering (Cash, MoMo, Bank Transfer, Credit, POS)
- [ ] Implement status filtering (Completed, Pending Payment, etc.)
- [ ] Add date range filtering for transaction searches
- [ ] Build search functionality across customer names and transaction details
- [ ] Create sales by channel breakdown view
- [ ] Implement sales by payment method breakdown view

## Phase 4: Workshop Management
- [ ] Build workshop daily log table with vehicle service records
- [ ] Implement mechanic assignment display and filtering
- [ ] Add job description and status tracking
- [ ] Create vehicle registration number search
- [ ] Build mechanic workload distribution view
- [ ] Implement job completion tracking and status updates

## Phase 5: Staff Management & Attendance
- [ ] Build staff attendance tracking table
- [ ] Display clock-in times, late days, and total hours worked
- [ ] Create mechanic performance metrics (jobs completed, average time per job)
- [ ] Implement staff performance comparison charts
- [ ] Add attendance target tracking (late days vs. target)
- [ ] Build staff roster view with role assignments

## Phase 6: Financial Management
- [ ] Build expense log table with filtering and search
- [ ] Create purchase order management interface
- [ ] Implement revenue tracking by channel and payment method
- [ ] Build creditors and credit sales tracking module
- [ ] Add expense categorization and breakdown
- [ ] Create financial summary reports

## Phase 7: Data Visualization & Charts
- [ ] Implement sales trend chart (daily/weekly/monthly)
- [ ] Create mechanic performance comparison chart
- [ ] Build revenue distribution by channel pie chart
- [ ] Add revenue by payment method chart
- [ ] Implement expense trend visualization
- [ ] Create staff performance leaderboard

## Phase 8: Reporting & Export
- [ ] Implement CSV export for all data tables
- [ ] Add Excel export functionality
- [ ] Create daily business report template
- [ ] Build weekly summary report
- [ ] Implement monthly financial report
- [ ] Add printing capability for reports
- [ ] Create CEO daily report format

## Phase 9: Inventory & Stock Management
- [ ] Build inventory tracking interface
- [ ] Implement stock level monitoring
- [ ] Add low-stock alerts
- [ ] Create inventory adjustment forms
- [ ] Build stock movement history

## Phase 10: Notifications & Alerts
- [ ] Implement critical threshold notifications (revenue targets, attendance issues)
- [ ] Build vehicle pending completion alerts (SLA tracking)
- [ ] Create payment pending notifications
- [ ] Add mechanic assignment notifications
- [ ] Implement notification center UI

## Phase 11: AI Chat Interface
- [ ] Build natural language chat interface component
- [ ] Implement query parsing for operational data
- [ ] Create AI-powered insights generation
- [ ] Add recommendation engine (e.g., mechanic efficiency suggestions)
- [ ] Build chat history and context management
- [ ] Implement response streaming for real-time feedback

## Phase 12: Advanced Features
- [ ] Build staff training modules interface
- [ ] Create project board for training management
- [ ] Implement business insights dashboard
- [ ] Build sales login and POS-like sales tracker
- [ ] Add role-based access control (admin, manager, staff)
- [ ] Implement audit logging for critical operations

## Phase 13: Testing & Optimization
- [ ] Write vitest tests for data fetching procedures
- [ ] Test filtering and search functionality
- [ ] Validate chart rendering and data accuracy
- [ ] Test export functionality
- [ ] Performance optimization for large datasets
- [ ] Cross-browser and responsive design testing

## Phase 14: Deployment & Handoff
- [ ] Final UI polish and consistency check
- [ ] Documentation for data sync and maintenance
- [ ] User training materials
- [ ] Create checkpoint for production deployment
