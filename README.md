# 🛡️ MehfoozPakistan — Crime Management & Analysis System (CMAS)

A comprehensive, data-driven platform designed to modernize crime reporting, investigation tracking, and predictive policing in Pakistan. Built as a full-stack web application with role-based access control for law enforcement officers and victims.

---

## 📋 Project Overview

CMAS (also known as MehfoozPakistan) provides law enforcement agencies with a centralized system that streamlines the complete crime lifecycle — from initial reporting and evidence tracking to investigation management, suspect profiling, and predictive analytics. The system enables data-driven decision making through advanced analytics, crime hotspot identification, and pattern detection.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with role-based access control (RBAC)
- Two user roles: **Officer** and **Victim**
- Separate login portals for Officers and Victims
- Secure password hashing with bcrypt
- Protected routes enforced on both frontend and backend

### 👮 Workflow 1 — Victim Reporting & Officer Review

This workflow covers the full end-to-end journey from a victim filing a report to an officer initiating an investigation:

**Step 1 — Victim Opens the Portal**
The victim logs into the dedicated Victim Portal (`/login/victim-witness`) using their registered email and password. Once authenticated, they are taken to their personal dashboard.

**Step 2 — Victim Files a Crime Report**
From the dashboard the victim fills out and submits a crime report, providing details such as the crime type, date, location, and description of the incident. The report is saved with status **Pending**.

**Step 3 — Victim Tracks Report Status**
The victim can view all their submitted reports and monitor the current status in real time: **Pending → Under Investigation → Resolved**.

**Step 4 — Officer Reviews the Report**
On the Officer Portal, the officer navigates to the Crime Reports section, where all incoming reports are listed. The officer reviews each report — evaluating its severity and legitimacy — and decides to either **Accept** or **Reject** it.

**Step 5 — Report Accepted → Status Updates to Under Investigation**
When the officer accepts a report, the report status automatically changes from **Pending** to **Under Investigation**. The victim sees this status change in their portal immediately.

**Step 6 — Crime Record Created**
Upon acceptance, the crime report is promoted to a full **Crime** entry in the officer's Crimes portal. The officer can now view, edit, and manage it as a live crime case — including assigning a crime type, location, and case details.

**Step 7 — Investigation Created**
With the crime now registered, the officer creates an **Investigation** linked to that crime. The investigation begins in **Active** status and becomes the central hub for all follow-up work (evidence, suspects, team assignment).

**Step 8 — Victim Sees Live Case Updates**
As the investigation progresses, the victim can click **View Details** on any report from their portal to see a live case tracking popup showing:
- **Linked Suspects** — every suspect connected to the crime, their role (Primary Suspect / Accomplice / Person of Interest), and current status (At Large / Arrested / Released)
- **Evidence Collected** — a table of all evidence items gathered by officers: type, who collected it, date, and current chain-of-custody status (Collected → Transferred → Analyzed → Stored → Released)
- **Investigation Details** — case number, lead officer, investigation status, and outcome
- **Arrest Banner** — a highlighted green banner appears automatically when any linked suspect is arrested

**Step 9 — Victim Notified on Arrest**
When a suspect is arrested, the victim receives a one-time in-portal notification popup (shown only once per newly-resolved report, tracked via browser storage). If email credentials are configured in the backend, the victim also receives an automated email from the system with the suspect's name, arrest date, arrest location, and case reference.

### 🔍 Workflow 2 — Investigation, Suspect & Evidence Management

This workflow covers everything that happens after an investigation is opened — building the case through team assignment, suspect profiling, and evidence tracking.

**Step 1 — Officer Opens the Investigation**
From the Investigations portal the officer views the newly created investigation (linked to the accepted crime from WF1). The investigation starts in **Active** status. The officer can edit its details, assign priority, and add notes.

**Step 2 — Investigation Team Assembly**
The officer navigates to the Team tab of the investigation and assigns other officers to the case, each with a specific role: **Field Officer**, **Detective**, **Forensics**, **Analyst**, or **Support**. Multiple officers can be added or removed at any time.

**Step 3 — Suspect Added to the System**
The officer creates a Suspect profile under the Suspects portal, recording personal details, physical description, criminal history, and current status (**At Large** / **Arrested** / **Released** / **Unknown**).

**Step 4 — Suspect Linked to the Crime**
The officer links the suspect to the relevant crime, specifying their role in the incident (**Primary Suspect**, **Accomplice**, or **Person of Interest**) and an initial arrest status (**Pending**, **Released**, **Cleared**).

**Step 5 — Evidence Collected and Logged**
The officer adds evidence items to the case, classifying each by type (**Physical**, **Digital**, **Document**, **Forensic**, **Biological**, **Weapon**). Every evidence item maintains a full **Chain of Custody** log — each action (Collected → Transferred → Analyzed → Stored → Released) is timestamped and attributed to the responsible officer via a stored procedure.

**Step 6 — Arrest Made**
When sufficient evidence is gathered, the officer marks the suspect as **Arrested**. This triggers an automatic cascade:
- The linked crime status is set to **Solved / Closed**
- The original crime report status updates to **Resolved**
- The investigation status changes to **Closed**
- An email notification is automatically sent to the linked victim informing them of the arrest

**Step 7 — Case Closed**
The officer can review the closed investigation, all linked evidence, and the full chain of custody log as a permanent record.

### 📊 Workflow 3 — Crime Analytics & Predictions

This workflow gives officers and commanders a data-driven view of crime patterns, hotspots, and future risk — enabling proactive policing decisions.

**Step 1 — Officer Opens the Analytics Dashboard**
The officer navigates to the Analytics section of the portal. The dashboard loads with 5 tabs, each providing a different analytical lens over the stored crime data.

**Step 2 — Overview Tab**
The officer sees a high-level summary: crime distribution by category (**Violent**, **Property**, **Cyber**, **White Collar**, **Drug Related**) displayed as percentages, plus a quick list of the top crime hotspot locations across the city.

**Step 3 — Trends Tab**
The officer reviews month-over-month crime trends. Each month shows the total crime count, cumulative running total, and the percentage change compared to the previous month, allowing the officer to spot rising or declining crime periods.

**Step 4 — Hotspots Tab**
A ranked table displays every recorded location ordered by total number of crimes. Each row shows the area, city, total crimes, solved crimes, and **solve rate** — helping commanders allocate patrol resources to high-risk zones.

**Step 5 — Patterns Tab**
The officer examines when crimes typically occur: crime frequency broken down by **day of week** and **hour of day**. This reveals patterns such as crime spikes on weekends or late-night hours, informing shift scheduling.

**Step 6 — Performance Tab**
Officer performance is ranked by the number of investigations handled and their individual **solve rate**. This supports management reviews and workload balancing across the department.

**Step 7 — Officer Opens the Predictions Page**
The officer navigates to the Predictions section, which offers three forward-looking tools built on historical crime data.

**Step 8 — Risk Assessment**
The officer inputs a city and area. The system computes a **risk score (0–10)**, assigns a risk level (**HIGH / MEDIUM / LOW**), calculates a severity rating, and provides a concrete recommendation (e.g. increase patrols, deploy specialists).

**Step 9 — Pattern Matching**
The officer searches for similar past crimes by selecting a crime type, city, area, and day of week. The system returns matching historical crimes ranked by frequency and recency, helping officers anticipate repeat offences.

**Step 10 — Forecast Trends**
The system projects future monthly crime counts based on historical data, showing year-over-year change, 3-month rolling averages, and a trend indicator (**Rising / Falling / Stable**) to support long-term strategic planning.

### 🗂️ Additional Modules
- Crimes management (full CRUD, filtering by status/type/date/location)
- Officers management
- Locations management
- Crime Types management

---

## 🛠️ Frameworks & Libraries Used

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js 18 (CRA) | UI framework |
| React Router v6 | Client-side routing |
| SweetAlert2 | Modals, alerts, confirmation dialogs |
| Vanilla CSS | Custom styling |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| oracledb | Oracle Database driver |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| nodemailer | Email notifications (victim alerts on arrest) |
| express-validator | Input validation |
| dotenv | Environment variable management |
| nodemon | Development auto-reload |

### Database
| Technology | Purpose |
|-----------|---------|
| Oracle Database XE | Primary database |
| PL/SQL Stored Procedures | Evidence chain of custody updates, crime-type lookups |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Oracle Database XE installed and running on `localhost:1521/xe`
- Oracle Instant Client (for oracledb)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/ARHAMJAMSHAID2003/Crime-Management-Analysis-System.git
cd Crime-Management-Analysis-System
```

---

### 2. Database Setup

1. Open Oracle SQL*Plus or SQL Developer and connect as your admin user.
2. Run the schema file to create all tables, constraints, and stored procedures:

```sql
@backend/schema/SCHEMAFinal.sql
```

3. (Optional) Run the sample data script to populate test data:

```sql
@backend/scripts/populate-sample-data.sql
```

---

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DB_USER=c##your_username
DB_PASSWORD=your_password
DB_CONNECTION_STRING=localhost:1521/xe
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Optional — for victim email notifications on suspect arrest
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> ⚠️ If your Oracle username contains `##` (e.g. `c##arham`), wrap it in quotes inside the `.env` file.

Set up victim account passwords:

```bash
npm run setup-credentials
```

Start the backend server:

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend runs on **http://localhost:5000**

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

### 5. Login Credentials (after running setup-credentials)

| Role | URL | Email | Password |
|------|-----|-------|----------|
| Officer | `/login/officer` | `ahmed.khan@police.gov.pk` | `changeme123` |
| Officer | `/login/officer` | `fatima.malik@police.gov.pk` | `changeme123` |
| Victim | `/login/victim-witness` | *(check DB for victim emails)* | `changeme123` |

---

## 👥 Team Contributions

### Arham Jamshaid
Responsible for **Workflow 1** — Victim Reporting & Officer Review (victim portal, crime report submission, officer review, case tracking, status updates).

### Anis
Responsible for **Workflow 2** — Investigation, Suspect & Evidence Management (investigations, suspects, evidence, arrest workflow, chain of custody).

### Fahad
Responsible for **Workflow 3** — Crime Analytics & Predictions (analytics dashboard, hotspot analysis, trend detection, pattern recognition, risk assessment, forecasting).

### Equally Shared
All other aspects of the project were divided equally among all three members — including database schema design, Oracle DB integration, JWT authentication, role-based access control, API architecture, frontend structure, testing, debugging, and documentation.

---

## 📁 Project Structure

```
Crime-Management-Analysis-System/
├── backend/
│   ├── app.js                  # Express app entry point
│   ├── config/db.js            # Oracle DB connection pool
│   ├── controllers/            # Route handler logic
│   ├── models/                 # Database query functions
│   ├── routes/                 # Express routers
│   ├── middlewares/            # Auth & role middleware
│   ├── schema/SCHEMAFinal.sql  # Full Oracle DB schema
│   └── scripts/                # Setup & utility scripts
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── App/            # Root router
│       │   ├── Auth/           # Login pages
│       │   ├── Dashboard/      # All officer dashboard pages
│       │   └── Reports/        # Victim portal pages
│       └── services/api.js     # Centralized API service
└── README.md
```

---

## 🔗 Repository

[https://github.com/ARHAMJAMSHAID2003/Crime-Management-Analysis-System](https://github.com/ARHAMJAMSHAID2003/Crime-Management-Analysis-System)
