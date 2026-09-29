# OmniFix | Smart Hardware Repair & Service Hub

![Production Status](https://img.shields.io/badge/Production-Live%20on%20Render-success?logo=render)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ed?logo=docker)
![Security](https://img.shields.io/badge/Security-Stateless%20JWT%20(HMAC--SHA256)-blue?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**OmniFix** is a production-grade, full-stack hardware repair ticket and workshop operations platform. Designed for hardware service centers, repair depots, and technical service hubs, OmniFix connects clients, bench specialists, and operations managers through an end-to-end service lifecycle:

$$\textbf{Customer Intake} \longrightarrow \textbf{Hardware Asset} \longrightarrow \textbf{Diagnostic Request} \longrightarrow \textbf{Bench Allocation} \longrightarrow \textbf{Repair} \longrightarrow \textbf{QA Verification} \longrightarrow \textbf{Pickup / Handover}$$

---

## Live Deployments & Cloud Infrastructure

The application is deployed live on the **Render Cloud Platform**:

| Component | Service Type | Live Production URL / Connection |
| :--- | :--- | :--- |
| **Frontend Portal** | Render Static Site | [https://repair-ticket-frontend.onrender.com](https://repair-ticket-frontend.onrender.com) |
| **Backend API** | Render Web Service (Docker) | [https://repair-ticket-backend.onrender.com](https://repair-ticket-backend.onrender.com) |
| **Database** | Managed PostgreSQL 16 | `postgresql://repair_ticket_db_user:***@dpg-datqe2id0e5s73d51jug-a/repair_ticket_db` |

---

## Production Verified Credentials

The system initializes with seeded accounts for each operational tier:

| Role / Portal | Portal URL | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Master Administrator** | [`/admin`](https://repair-ticket-frontend.onrender.com/admin) | `admin` | `Admin@OmniFix2026!` | • Command Center KPIs & Attention Required triage<br>• Specialist roster, workload & capacity management<br>• Manual assignment, reassignment & status overrides<br>• Global search (Cmd/Ctrl + K) & customer CRM |
| **Workshop Specialist** | [`/technician`](https://repair-ticket-frontend.onrender.com/technician) | `tech_marcus_vance` | `Tech@OmniFix2026!` | • Claim unassigned intake tickets from pool<br>• Real-time bench diagnostic progression<br>• Append immutable diagnostic timeline updates<br>• Complete repair & pass to QA check |
| **Client Customer** | [`/`](https://repair-ticket-frontend.onrender.com/) | `alexmercer` | `Client@OmniFix2026!` | • Self-service client repair dashboard<br>• 4-step hardware intake booking wizard<br>• Fleet hardware management (laptops, phones, desktops)<br>• Ticket cancellation before bench allocation |
| **Public Live Tracker** | [`/track`](https://repair-ticket-frontend.onrender.com/track) | *(Public)* | *(No auth)* | • Zero-login real-time lookup by Ticket Code<br>• 6-milestone visual stepper & diagnostic history<br>• Privacy-masked customer & hardware serial details |

> [!NOTE]
> New customers can also self-register 24/7 directly from the **Create Account** tab on the Customer Portal ([https://repair-ticket-frontend.onrender.com/](https://repair-ticket-frontend.onrender.com/)).

---

## System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (Render Static Site)"]
        UI_Cust["Customer Portal\n(/)"]
        UI_Tech["Technician Workbench\n(/technician)"]
        UI_Admin["Operations Command Center\n(/admin)"]
        UI_Track["Public Live Tracker\n(/track)"]
    end

    subgraph APILayer ["Backend Application Layer (Render Docker Service)"]
        GW["REST API Gateway & CORS Filter\nhttps://repair-ticket-backend.onrender.com"]
        SEC["Spring Security Filter Chain\n(Stateless JWT HMAC-SHA256)"]
        
        subgraph Controllers ["Spring REST Controllers (/api/*)"]
            C_Auth["AuthController"]
            C_Ticket["RepairTicketController"]
            C_Cust["CustomerController"]
            C_Dev["DeviceController"]
            C_Tech["TechnicianController"]
            C_Upd["RepairUpdateController"]
        end

        subgraph CoreService ["Business Domain & FSM Engine"]
            S_Ticket["RepairTicketService (FSM Validation)"]
            S_Tech["TechnicianService (Capacity Tracking)"]
            S_Auth["AuthService (JWT Minting)"]
        end

        HIKARI["HikariCP Connection Pool\n(Min: 2, Max: 10)"]
    end

    subgraph DataLayer ["Cloud Persistence Layer (Render PostgreSQL 16)"]
        DB[("Database: repair_ticket_db\nTables: users, technicians, customers,\ndevices, repair_tickets, repair_updates")]
    end

    ClientLayer -->|HTTPS / JSON + Bearer JWT| GW
    GW --> SEC
    SEC --> Controllers
    Controllers --> CoreService
    CoreService --> HIKARI
    HIKARI -->|SSL JDBC / TCP 5432| DB
```

---

## Repair Lifecycle Finite State Machine (FSM)

The lifecycle of each repair order is strictly managed by state validation logic:

```mermaid
stateDiagram-v2
    [*] --> OPEN: Customer / Admin Intake
    OPEN --> ASSIGNED: Tech Assigned / Claimed
    OPEN --> CANCELLED: Customer / Admin Cancel
    ASSIGNED --> IN_PROGRESS: Bench Diagnostic Started
    ASSIGNED --> OPEN: Unassigned / Reallocated
    IN_PROGRESS --> REPAIR_COMPLETED: Bench Repair Finished
    IN_PROGRESS --> CANCELLED: Cancelled with Justification
    REPAIR_COMPLETED --> CLOSED: QA Verified & Picked Up
    CANCELLED --> [*]
    CLOSED --> [*]
```

| Lifecycle Status | Description | Permitted Roles | Next Allowed States |
| :--- | :--- | :--- | :--- |
| `OPEN` | Ticket logged; pending triage and specialist assignment | Customer, Admin | `ASSIGNED`, `CANCELLED` |
| `ASSIGNED` | Assigned to a specific bench technician; waiting for bench opening | Admin, Technician | `IN_PROGRESS`, `OPEN`, `CANCELLED` |
| `IN_PROGRESS` | Hardware is actively on the bench under diagnostic/soldering work | Technician, Admin | `REPAIR_COMPLETED`, `CANCELLED` |
| `REPAIR_COMPLETED`| Technical work finished; pending QA testing and customer collection | Technician, Admin | `CLOSED` |
| `CLOSED` | Device verified, handed back to customer; ticket resolved | Admin | *(Terminal State)* |
| `CANCELLED` | Order terminated prior to repair completion with recorded reason | Customer, Admin | *(Terminal State)* |

---

## Core Features by Portal

### 1. Operations & Admin Desk (`/admin`)
- **Operations Command Center**: Live metrics displaying *Total in Queue*, *Pending Intake*, *Active On Bench*, and *Ready For Pickup*.
- **Attention Required Triage**: Automatically flags bottlenecks:
  - *Needs Assignment*: Unassigned tickets sitting in queue.
  - *SLA / Overdue Alerts*: Repairs exceeding estimated completion dates.
  - *Active on Bench*: Hardware currently disassembled.
  - *Ready for Pickup*: Units awaiting customer retrieval.
- **Specialist Capacity Roster**: Visual utilization bars indicating bench loads, assigned count, and availability per technician.
- **Dual View Modes**: Switch between high-density **9-Column Table View** and interactive **5-Stage Kanban Board**.
- **Deep 5-Tab Inspection Drawer & Modal**:
  - *Overview*: Customer contact, device specs, priority level, and SLA timeline.
  - *Diagnostic Feed*: Timestamped technician service notes.
  - *FSM State Controller*: Validated state progression buttons.
  - *Hardware Specs*: Serial number, brand, model, and category.
  - *Audit History*: Complete immutable log of state transitions.

### 2. Workshop Specialist Bench (`/technician`)
- **Claim Pool**: View all unassigned hardware units and claim them directly to your personal bench.
- **Active Bench Workspace**: Dedicated view of hardware currently under repair.
- **One-Click Progression**: Direct actions for `Start Bench Repair`, `Complete Repair`, and `Pause / Revert`.
- **Diagnostic Note Logger**: Append technical notes (micro-soldering results, replaced capacitors, stress test results).

### 3. Customer Self-Service Portal (`/`)
- **Active Repair Cards & Table**: Real-time status cards with SLA turnaround estimates, priority badges, and direct links to the public tracker.
- **4-Step Intake Booking Wizard**:
  1. *Select or Register Hardware*: Pick from existing registered assets or register a new device.
  2. *Symptom Diagnostics*: Contextual symptom selector (No Power, Cracked Screen, Liquid Damage, Thermal Throttling, etc.).
  3. *Turnaround SLA*: Choose between *Standard (5-7 days)*, *Expedited (2-3 days)*, *Urgent (24h)*, or *Emergency Same-Day*.
  4. *Confirmation Receipt*: Instant pre-flight intake receipt with ticket number and printable summary.
- **Hardware Fleet Manager**: Register and track multiple laptops, smartphones, tablets, and desktop workstations.

### 4. Public Live Service Tracker (`/track`)
- **Zero-Login Lookup**: Customers enter their Ticket Number (`TICK-YYYYMMDD-XXXXXXXX`) to see live progress.
- **6-Milestone Linear Progress Stepper**: Intake $\rightarrow$ Triage $\rightarrow$ Assigned $\rightarrow$ In Repair $\rightarrow$ Quality Testing $\rightarrow$ Ready for Pickup.
- **Privacy Masking**: Automatically redacts private customer information (e.g., `A*** M*****`) and serial numbers (`C02M3***`).

---

## REST API Specification

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | `{ "username": "...", "password": "..." }` | Authenticates user; returns JWT token, roles, and ID |
| `POST` | `/api/auth/register` | None | `{ "username": "...", "password": "...", "fullName": "..." }` | Self-registration for `ROLE_USER` clients |

### 2. Repair Tickets (`/api/tickets`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Admin, Tech | Paginated ticket queue with search, status, priority, and date filters |
| `POST` | `/api/tickets` | Authenticated | Create a new repair ticket |
| `GET` | `/api/tickets/{id}` | Authenticated | Retrieve full ticket detail by numeric ID |
| `GET` | `/api/tickets/number/{num}` | Public | Zero-auth public tracking by ticket number |
| `PATCH` | `/api/tickets/{id}/status` | Admin, Tech | Advance FSM lifecycle status with optional transition note |
| `POST` | `/api/tickets/{id}/assign` | Admin, Tech | Assign or claim technician to ticket |
| `POST` | `/api/tickets/{id}/unassign` | Admin | Unassign technician; reverts ticket to `OPEN` |
| `POST` | `/api/tickets/{id}/cancel` | Admin, User | Cancel ticket with mandatory cancellation reason |
| `GET` | `/api/tickets/customer/{id}` | Authenticated | Fetch all tickets associated with a customer ID |
| `GET` | `/api/tickets/{id}/updates` | Authenticated | Retrieve diagnostic note timeline for ticket |
| `GET` | `/api/tickets/number/{num}/updates`| Public | Retrieve public diagnostic timeline |
| `POST` | `/api/tickets/{id}/updates` | Admin, Tech | Append a new diagnostic progress note |
| `DELETE`| `/api/tickets/{id}` | Admin | Delete a ticket and cascade associated updates |

### 3. Customers & Hardware Assets (`/api/customers`, `/api/devices`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | Admin | List all registered customers with ticket counts |
| `POST` | `/api/customers` | Authenticated | Create customer record (Name, Phone, Email, Address) |
| `GET` | `/api/customers/{id}` | Authenticated | Get customer profile details |
| `GET` | `/api/devices` | Admin | List all registered hardware devices |
| `POST` | `/api/devices` | Authenticated | Register new device (Brand, Model, Serial, Type) |
| `GET` | `/api/devices/customer/{id}` | Authenticated | List all devices belonging to a customer |

### 4. Technicians & Workshop Staff (`/api/technicians`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/technicians` | Admin, Tech | List all technicians with active workload count |
| `GET` | `/api/technicians/active` | Admin, Tech | List only active technicians eligible for assignment |
| `POST` | `/api/technicians` | Admin | Onboard new technician; auto-creates user login account |
| `PUT` | `/api/technicians/{id}` | Admin | Update technician details, phone, or specialization |
| `PATCH` | `/api/technicians/{id}/status` | Admin | Toggle technician active/inactive status |
| `DELETE`| `/api/technicians/{id}` | Admin | Safely decommission technician (validates zero open tickets) |

---

## Database Architecture

The relational schema is hosted on PostgreSQL 16:

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar password
        varchar full_name
        varchar role
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    customers {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone_number
        varchar address
        timestamp created_at
        timestamp updated_at
    }

    devices {
        bigint id PK
        varchar brand
        varchar model
        varchar serial_number UK
        varchar device_type
        bigint customer_id FK
        timestamp created_at
        timestamp updated_at
    }

    technicians {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone_number
        varchar specialization
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    repair_tickets {
        bigint id PK
        varchar ticket_number UK
        text issue_description
        varchar priority
        varchar status
        date estimated_completion_date
        bigint customer_id FK
        bigint device_id FK
        bigint assigned_technician_id FK
        timestamp created_at
        timestamp updated_at
    }

    repair_updates {
        bigint id PK
        bigint repair_ticket_id FK
        bigint technician_id FK
        varchar previous_status
        varchar new_status
        text notes
        timestamp created_at
    }

    customers ||--o{ devices : "owns"
    customers ||--o{ repair_tickets : "submits"
    devices ||--o{ repair_tickets : "serviced in"
    technicians ||--o{ repair_tickets : "assigned to"
    repair_tickets ||--o{ repair_updates : "history log"
    technicians ||--o{ repair_updates : "logged by"
```

---

## Production Cloud Configuration (Render)

### Backend Web Service Settings
- **Service Name**: `repair-ticket-backend`
- **Environment**: Docker (Multi-stage build with `eclipse-temurin:26-jdk` and `eclipse-temurin:26-jre`)
- **Port**: Dynamically bound via `${PORT:8082}`
- **Memory Management**: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` to operate reliably within Render free/starter tiers.
- **Environment Variables**:
  ```ini
  PORT=8082
  DB_URL=postgresql://repair_ticket_db_user:r6TQjyUXoQYjgAJ8H85cW5G5k4BXoYi3@dpg-datqe2id0e5s73d51jug-a/repair_ticket_db
  JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  JWT_EXPIRATION_MS=86400000
  ALLOWED_ORIGINS=https://repair-ticket-frontend.onrender.com,http://localhost:5173
  ```

### Frontend Static Site Settings
- **Service Name**: `repair-ticket-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  ```ini
  VITE_API_URL=https://repair-ticket-backend.onrender.com/api
  ```
- **SPA Rewrites**:
  - `/*` $\rightarrow$ `/index.html` (Rewrite, Status 200)

---

## Local Development & Setup

### Prerequisites
- **Java**: JDK 21 or 26
- **Node.js**: 18.x or higher
- **PostgreSQL**: Local instance or Docker

### 1. Database
```bash
docker compose up -d
```
*(Starts PostgreSQL on port `5432` with database `repair_ticket_db`)*

### 2. Backend Service
```bash
cd repair-ticket-backend
.\mvnw.cmd spring-boot:run
```
*(Runs on [http://localhost:8082](http://localhost:8082))*

### 3. Frontend Application
```bash
cd repair-ticket-frontend
npm install
npm run dev
```
*(Runs on [http://localhost:5173](http://localhost:5173))*

---

## Project Repository Structure

```
repair-ticket/
├── .gitignore                          # Root ignore file
├── docker-compose.yml                  # Local PostgreSQL 16 container definition
├── render.yaml                         # Render Infrastructure-as-Code Blueprint
├── README.md                           # Master Project Documentation
├── repair-ticket-backend/              # Spring Boot 4.1.1 Java REST API
│   ├── Dockerfile                      # Multi-stage container build for Render
│   ├── .dockerignore                   # Docker build ignore rules
│   ├── pom.xml                         # Maven dependencies & build plugins
│   └── src/main/
│       ├── java/com/bharath/repairticket/
│       │   ├── config/                 # SecurityConfig, DatabaseConfig, DataInitializer
│       │   ├── controller/             # REST API Controllers
│       │   ├── dto/                    # Request/Response Data Transfer Objects
│       │   ├── entity/                 # JPA Entities (User, Ticket, Customer, Device, Tech)
│       │   ├── exception/              # Global Exception Handling & Error Responses
│       │   ├── repository/             # Spring Data JPA Repositories
│       │   ├── security/               # JWT Token Provider, Auth Filter & Entry Points
│       │   └── service/                # Business logic, FSM validation & services
│       └── resources/
│           └── application.properties  # HikariCP, JPA, JWT, and Port configuration
└── repair-ticket-frontend/             # React 19 + Vite 8 SPA
    ├── package.json                    # Dependencies & build scripts
    ├── vite.config.js                  # Vite bundler & local dev proxy configuration
    ├── index.html                      # HTML5 Entry Point
    └── src/
        ├── components/                 # Portal views (Customer, Technician, Admin, Tracker)
        │   ├── common/                 # Reusable UI components (StatCards, Badges, Modals)
        │   ├── layout/                 # Topbar, Sidebar, Global Command Palette (Cmd+K)
        │   └── tickets/                # Kanban board, TicketDrawer, WorkspaceModal, Wizard
        ├── context/                    # AuthContext (JWT session), ToastContext
        ├── pages/                      # Role-specific login pages (Customer, Tech, Admin)
        └── services/
            └── api.js                  # Centralized HTTP Client with dynamic API URL
```

---

## License

This project is licensed under the [MIT License](LICENSE).
