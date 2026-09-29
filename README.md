OMNIFIX
Smart Hardware Repair & Service Hub
Full-Stack Hardware Repair Ticket and Workshop Operations Platform

Technology Stack

Backend: Spring Boot 4.1.1
Frontend: React 19.0
Build Tool: Vite 8.3
Database: PostgreSQL 16
Containerization: Docker
Security: Stateless JWT Authentication using HMAC-SHA256
Cloud Platform: Render
License: MIT

Production Status: Live on Render

1. Project Overview

OmniFix is a production-grade, full-stack hardware repair ticket and workshop operations platform designed for hardware service centers, repair depots, and technical service hubs.

The platform connects customers, workshop specialists, and operations managers through a complete hardware repair lifecycle.

Service Lifecycle

Customer Intake → Hardware Asset → Diagnostic Request → Bench Allocation → Repair → QA Verification → Pickup / Handover

The system provides separate interfaces for customers, technicians, administrators, and public ticket tracking. It manages the complete repair process from ticket creation through assignment, diagnosis, repair, quality verification, and closure.

2. Live Deployment & Cloud Infrastructure

The OmniFix application is deployed on the Render Cloud Platform.

Component	Service Type	Production URL / Connection
Frontend Portal	Render Static Site	https://repair-ticket-frontend.onrender.com
Backend API	Render Web Service using Docker	https://repair-ticket-backend.onrender.com
Database	Managed PostgreSQL 16	Production PostgreSQL database
3. Application Portals

OmniFix provides different portals based on the user's role.

3.1 Master Administrator

Portal: /admin

Main Capabilities
Command Center KPIs
Attention-required ticket triage
Specialist roster management
Technician workload and capacity monitoring
Manual ticket assignment
Ticket reassignment
Status overrides
Global search using Ctrl + K / Cmd + K
Customer CRM functionality
3.2 Workshop Specialist

Portal: /technician

Main Capabilities
Claim unassigned intake tickets
View assigned repair tickets
Monitor active bench workload
Perform diagnostic operations
Add diagnostic timeline updates
Complete repairs
Pass completed repairs to QA verification
3.3 Client Customer

Portal: /

Main Capabilities
Self-service repair dashboard
Four-step hardware intake booking
Hardware fleet management
Laptop, smartphone, desktop, and other device registration
Ticket tracking
Ticket cancellation before bench allocation

New customers can also create an account directly through the Create Account option on the customer portal.

3.4 Public Live Tracker

Portal: /track

Main Capabilities
No-login ticket tracking
Ticket-code based lookup
Six-milestone progress tracker
Diagnostic history
Privacy-masked customer information
Privacy-masked hardware serial numbers
4. System Architecture

OmniFix follows a layered full-stack architecture consisting of:

Presentation Layer

The frontend is implemented using React 19 and Vite and provides:

Customer Portal
Technician Workbench
Operations Command Center
Public Live Tracker
Application Layer

The backend is implemented using Spring Boot and exposes REST APIs.

Major backend components include:

REST API Gateway
CORS Filter
Spring Security Filter Chain
Authentication Controller
Repair Ticket Controller
Customer Controller
Device Controller
Technician Controller
Repair Update Controller
Business Service Layer
FSM Validation
Technician Capacity Tracking
JWT Authentication Service
HikariCP Connection Pool
Persistence Layer

The application uses PostgreSQL 16 as its relational database.

Main tables include:

users
customers
technicians
devices
repair_tickets
repair_updates

The application communicates with the backend using HTTPS and JSON, with authenticated requests carrying a Bearer JWT.

5. Repair Lifecycle – Finite State Machine

The repair process is controlled using a Finite State Machine (FSM).

Lifecycle

OPEN → ASSIGNED → IN_PROGRESS → REPAIR_COMPLETED → CLOSED

Alternative transitions include:

OPEN → CANCELLED
ASSIGNED → OPEN
ASSIGNED → CANCELLED
IN_PROGRESS → CANCELLED
Lifecycle States
Status	Description	Permitted Roles	Next Allowed States
OPEN	Ticket logged and waiting for triage and assignment	Customer, Admin	ASSIGNED, CANCELLED
ASSIGNED	Ticket assigned to a technician	Admin, Technician	IN_PROGRESS, OPEN, CANCELLED
IN_PROGRESS	Device is actively being diagnosed or repaired	Technician, Admin	REPAIR_COMPLETED, CANCELLED
REPAIR_COMPLETED	Repair finished and awaiting QA/customer collection	Technician, Admin	CLOSED
CLOSED	Device verified and handed back to customer	Admin	Terminal State
CANCELLED	Repair order terminated before completion	Customer, Admin	Terminal State

The FSM ensures that invalid state transitions cannot occur during the repair lifecycle.

6. Core Features
6.1 Operations & Administration Desk

Portal: /admin

Operations Command Center

The dashboard provides live operational metrics such as:

Total in Queue
Pending Intake
Active on Bench
Ready for Pickup
Attention Required Triage

The system identifies operational bottlenecks including:

Needs Assignment – tickets waiting for technician assignment
SLA / Overdue Alerts – repairs exceeding expected completion dates
Active on Bench – hardware currently undergoing repair
Ready for Pickup – completed devices awaiting customer collection
Technician Capacity Management

The administrator can view:

Technician workload
Assigned ticket count
Bench utilization
Technician availability
Ticket Views

The system provides two major ticket visualization modes:

Nine-column Table View
Five-stage Kanban Board
Ticket Inspection

The inspection drawer/modal provides:

Overview

Customer information
Device specifications
Priority
SLA timeline

Diagnostic Feed

Timestamped technician notes

FSM State Controller

Validated lifecycle transition controls

Hardware Specifications

Serial number
Brand
Model
Device category

Audit History

Complete state-transition history
7. Workshop Specialist Bench

Portal: /technician

Claim Pool

Technicians can view unassigned repair tickets and claim them directly.

Active Bench Workspace

Displays hardware currently assigned to the technician.

One-Click Progression

Technicians can perform actions such as:

Start Bench Repair
Complete Repair
Pause / Revert
Diagnostic Note Logger

Technicians can record technical information including:

Micro-soldering results
Replaced components
Stress-test results
Diagnostic observations
8. Customer Self-Service Portal

Portal: /

The customer dashboard provides real-time visibility into repair activities.

Active Repair Dashboard

Customers can view:

Current repair status
SLA estimates
Priority indicators
Public tracker links
8.1 Four-Step Intake Booking Wizard
Step 1 – Select or Register Hardware

Customers can either:

Select an existing device
Register a new device
Step 2 – Symptom Diagnostics

Customers select the relevant hardware problem, such as:

No Power
Cracked Screen
Liquid Damage
Thermal Throttling
Other device-specific symptoms
Step 3 – Turnaround SLA

Customers can select:

Standard – 5–7 days
Expedited – 2–3 days
Urgent – 24 hours
Emergency – Same Day
Step 4 – Confirmation Receipt

The system generates:

Intake confirmation
Ticket number
Printable summary
9. Hardware Fleet Manager

Customers can register and manage multiple hardware devices, including:

Laptops
Smartphones
Tablets
Desktop Workstations

Each device can be associated with its corresponding repair tickets.

10. Public Live Service Tracker

Portal: /track

The public tracking system allows customers to track repairs without logging into the application.

Ticket Lookup

Customers enter their ticket number in the format:

TICK-YYYYMMDD-XXXXXXXX

Six-Milestone Progress

The system displays:

Intake → Triage → Assigned → In Repair → Quality Testing → Ready for Pickup

Privacy Protection

Sensitive information is automatically masked.

Example:

Customer: A*** M*****
Serial Number: C02M3***

This allows customers to monitor progress without exposing sensitive personal or hardware information.

11. REST API Specification
11.1 Authentication APIs

Base URL:

/api/auth

Method	Endpoint	Authentication	Description
POST	/api/auth/login	None	Authenticates the user and returns JWT, role, and user ID
POST	/api/auth/register	None	Registers a new customer account
12. Repair Ticket APIs

Base URL:

/api/tickets

Method	Endpoint	Authentication	Description
GET	/api/tickets	Admin, Technician	Paginated ticket queue with filters
POST	/api/tickets	Authenticated	Create a repair ticket
GET	/api/tickets/{id}	Authenticated	Retrieve ticket details
GET	/api/tickets/number/{num}	Public	Track ticket using ticket number
PATCH	/api/tickets/{id}/status	Admin, Technician	Advance FSM status
POST	/api/tickets/{id}/assign	Admin, Technician	Assign or claim technician
POST	/api/tickets/{id}/unassign	Admin	Remove technician assignment
POST	/api/tickets/{id}/cancel	Admin, User	Cancel ticket with reason
GET	/api/tickets/customer/{id}	Authenticated	Retrieve customer's tickets
GET	/api/tickets/{id}/updates	Authenticated	Retrieve diagnostic timeline
GET	/api/tickets/number/{num}/updates	Public	Retrieve public diagnostic timeline
POST	/api/tickets/{id}/updates	Admin, Technician	Add diagnostic update
DELETE	/api/tickets/{id}	Admin	Delete ticket and related updates
13. Customer & Hardware APIs
Customer APIs

Base URL:

/api/customers

Method	Endpoint	Authentication	Description
GET	/api/customers	Admin	List registered customers
POST	/api/customers	Authenticated	Create customer
GET	/api/customers/{id}	Authenticated	Retrieve customer details
Device APIs

Base URL:

/api/devices

Method	Endpoint	Authentication	Description
GET	/api/devices	Admin	List registered devices
POST	/api/devices	Authenticated	Register a hardware device
GET	/api/devices/customer/{id}	Authenticated	Retrieve customer's devices
14. Technician Management APIs

Base URL:

/api/technicians

Method	Endpoint	Authentication	Description
GET	/api/technicians	Admin, Technician	List technicians and workloads
GET	/api/technicians/active	Admin, Technician	List active technicians
POST	/api/technicians	Admin	Add new technician
PUT	/api/technicians/{id}	Admin	Update technician information
PATCH	/api/technicians/{id}/status	Admin	Activate/deactivate technician
DELETE	/api/technicians/{id}	Admin	Decommission technician

The decommissioning operation validates that the technician has no open tickets before removal.

15. Database Architecture

OmniFix uses PostgreSQL 16 as the primary relational database.

15.1 Users
Field	Type	Constraint
id	bigint	Primary Key
username	varchar	Unique
password	varchar	—
full_name	varchar	—
role	varchar	—
enabled	boolean	—
created_at	timestamp	—
updated_at	timestamp	—
15.2 Customers
Field	Type	Constraint
id	bigint	Primary Key
first_name	varchar	—
last_name	varchar	—
email	varchar	Unique
phone_number	varchar	—
address	varchar	—
created_at	timestamp	—
updated_at	timestamp	—
15.3 Devices
Field	Type	Constraint
id	bigint	Primary Key
brand	varchar	—
model	varchar	—
serial_number	varchar	Unique
device_type	varchar	—
customer_id	bigint	Foreign Key
created_at	timestamp	—
updated_at	timestamp	—
15.4 Technicians
Field	Type	Constraint
id	bigint	Primary Key
first_name	varchar	—
last_name	varchar	—
email	varchar	Unique
phone_number	varchar	—
specialization	varchar	—
is_active	boolean	—
created_at	timestamp	—
updated_at	timestamp	—
15.5 Repair Tickets
Field	Type	Constraint
id	bigint	Primary Key
ticket_number	varchar	Unique
issue_description	text	—
priority	varchar	—
status	varchar	—
estimated_completion_date	date	—
customer_id	bigint	Foreign Key
device_id	bigint	Foreign Key
assigned_technician_id	bigint	Foreign Key
created_at	timestamp	—
updated_at	timestamp	—
15.6 Repair Updates
Field	Type	Constraint
id	bigint	Primary Key
repair_ticket_id	bigint	Foreign Key
technician_id	bigint	Foreign Key
previous_status	varchar	—
new_status	varchar	—
notes	text	—
created_at	timestamp	—
16. Database Relationships

The database follows these major relationships:

One Customer can own multiple Devices.
One Customer can submit multiple Repair Tickets.
One Device can have multiple Repair Tickets.
One Technician can be assigned multiple Repair Tickets.
One Repair Ticket can contain multiple Repair Updates.
One Technician can create multiple Repair Updates.

This relational structure provides traceability across customers, devices, technicians, repair tickets, and diagnostic history.

17. Production Cloud Configuration
17.1 Backend Web Service

Service Name: repair-ticket-backend

Environment: Docker

The application uses a multi-stage Docker build based on:

eclipse-temurin:26-jdk
eclipse-temurin:26-jre

Port:

8082

The application dynamically binds to the Render-provided PORT environment variable.

JVM Configuration

The application uses:

-XX:+UseContainerSupport

and

-XX:MaxRAMPercentage=75.0

to improve operation within container resource limits.

18. Environment Variables

For security, production secrets should not be placed directly into a project report.

Use the following sanitized representation:

PORT=8082

DB_URL=<PRODUCTION_POSTGRESQL_CONNECTION_STRING>

JWT_SECRET=<PRODUCTION_JWT_SECRET>

JWT_EXPIRATION_MS=86400000

ALLOWED_ORIGINS=https://repair-ticket-frontend.onrender.com,http://localhost:5173

Security Note: The original document contains live database credentials and a JWT signing secret. Those values should be removed from the Word document and rotated if they have been exposed publicly.

19. Frontend Static Site Configuration

Service Name:

repair-ticket-frontend

Build Command
npm install && npm run build
Publish Directory
dist
API Configuration
VITE_API_URL=https://repair-ticket-backend.onrender.com/api
SPA Rewrite
/* → /index.html
Status: 200

This ensures that React client-side routes work correctly when accessed directly.

20. Local Development Setup
20.1 Prerequisites

The following software is required:

Java JDK 21 or 26
Node.js 18.x or higher
PostgreSQL or Docker
20.2 Start Database

Run:

docker compose up -d

This starts PostgreSQL on port:

5432

Database:

repair_ticket_db
20.3 Start Backend

Navigate to the backend directory:

cd repair-ticket-backend

Run:

.\mvnw.cmd spring-boot:run

Backend runs on:

http://localhost:8082
20.4 Start Frontend

Navigate to the frontend directory:

cd repair-ticket-frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend runs on:

http://localhost:5173

21. Project Repository Structure
repair-ticket/
│
├── .gitignore
│   └── Root ignore configuration
│
├── docker-compose.yml
│   └── Local PostgreSQL 16 container definition
│
├── render.yaml
│   └── Render Infrastructure-as-Code configuration
│
├── README.md
│   └── Master project documentation
│
├── repair-ticket-backend/
│   ├── Dockerfile
│   │   └── Multi-stage Docker build
│   │
│   ├── .dockerignore
│   │   └── Docker build ignore rules
│   │
│   ├── pom.xml
│   │   └── Maven dependencies and plugins
│   │
│   └── src/main/
│       ├── java/com/bharath/repairticket/
│       │
│       ├── config/
│       │   └── SecurityConfig, DatabaseConfig,
│       │       DataInitializer
│       │
│       ├── controller/
│       │   └── REST API Controllers
│       │
│       ├── dto/
│       │   └── Request/Response DTOs
│       │
│       ├── entity/
│       │   └── JPA Entities
│       │
│       ├── exception/
│       │   └── Global Exception Handling
│       │
│       ├── repository/
│       │   └── Spring Data JPA Repositories
│       │
│       ├── security/
│       │   └── JWT Token Provider and Authentication Filter
│       │
│       └── service/
│           └── Business Logic and FSM Validation
│
│       └── resources/
│           └── application.properties
│
└── repair-ticket-frontend/
    ├── package.json
    │   └── Dependencies and build scripts
    │
    ├── vite.config.js
    │   └── Vite configuration
    │
    ├── index.html
    │   └── HTML5 entry point
    │
    └── src/
        ├── components/
        │   ├── common/
        │   │   └── Reusable UI components
        │   │
        │   ├── layout/
        │   │   └── Topbar, Sidebar, Command Palette
        │   │
        │   └── tickets/
        │       └── Kanban Board, Ticket Drawer,
        │           Workspace Modal, Wizard
        │
        ├── context/
        │   ├── AuthContext
        │   └── ToastContext
        │
        ├── pages/
        │   └── Role-specific login pages
        │
        └── services/
            └── api.js
                └── Centralized HTTP Client

22. Security Architecture

OmniFix implements a stateless JWT-based authentication architecture.

Security Components
Spring Security
JWT Authentication
HMAC-SHA256 signing
Stateless sessions
Role-based access control
CORS configuration
Bearer token authentication
Public ticket tracking
Privacy masking
Authentication Flow

User Login

↓

Spring Security Authentication

↓

JWT Token Generation

↓

Client Stores Authentication Token

↓

Bearer Token Sent with API Requests

↓

JWT Validation

↓

Role-Based Authorization

↓

Protected REST API

23. Key Technical Highlights

The major technical aspects demonstrated by OmniFix include:

Backend
Spring Boot
Spring REST APIs
Spring Security
JWT Authentication
Role-Based Authorization
Spring Data JPA
Hibernate
DTO-based API design
Service Layer Architecture
Repository Pattern
Global Exception Handling
FSM-based business validation
Frontend
React 19
Vite
Component-based architecture
Context API
Responsive dashboards
Kanban interface
Modal and drawer components
Role-specific interfaces
Client-side routing
Database
PostgreSQL 16
Relational data modeling
Primary Keys
Foreign Keys
Unique constraints
Entity relationships
Audit history
DevOps & Cloud
Docker
Multi-stage Docker builds
Render deployment
Render PostgreSQL
Environment-based configuration
Production frontend/backend separation
24. End-to-End Workflow

The complete OmniFix workflow can be summarized as follows:

Step 1 – Customer Registration

The customer creates an account or logs into the platform.

Step 2 – Hardware Registration

The customer registers a laptop, smartphone, tablet, desktop, or other supported device.

Step 3 – Repair Intake

The customer creates a repair ticket and provides the hardware issue.

Step 4 – SLA Selection

The customer selects the expected repair turnaround.

Step 5 – Ticket Creation

The system creates a unique repair ticket number.

Step 6 – Administrative Triage

The administrator reviews incoming repair requests.

Step 7 – Technician Assignment

The ticket is assigned to an available workshop specialist.

Step 8 – Bench Diagnosis

The technician begins diagnostic work.

Step 9 – Repair

The technician performs the required repair.

Step 10 – Diagnostic Updates

The technician records repair progress and technical notes.

Step 11 – Repair Completion

The technician marks the repair as completed.

Step 12 – QA Verification

The completed device undergoes quality verification.

Step 13 – Customer Pickup

The device becomes ready for customer collection.

Step 14 – Ticket Closure

The administrator closes the repair ticket.

25. Project Conclusion

OmniFix provides a complete digital workflow for managing hardware repair operations.

The platform integrates:

Customer self-service
Hardware asset management
Repair ticket management
Technician workload management
Diagnostic tracking
FSM-based workflow validation
Administrative monitoring
Public ticket tracking
JWT-based security
PostgreSQL persistence
Docker containerization
Cloud deployment

By combining these components into a single platform, OmniFix provides an end-to-end solution for managing hardware service operations from customer intake to final handover.

26. License

This project is licensed under the MIT License