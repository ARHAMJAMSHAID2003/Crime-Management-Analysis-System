# CMAS Backend - Crime Management Analysis System

Node.js + Express backend for CMAS (MehfoozPakistan) with Oracle Database integration.

## Project Overview
CMAS is a role-based crime management platform supporting:
- Victim crime reporting and officer review
- Investigation and evidence management
- Crime analytics and prediction

## Milestone 3 Coverage (Web-Based Application Development)
This backend keeps all existing CMAS functionality and additionally maps three non-auth workflows for milestone grading.
These workflows are implemented on top of the full system (not as replacements).

### Workflow 1: Victim Crime Reporting and Officer Review
Primary Entity: `Crime_Report` (full CRUD)
- List: `GET /api/crime-reports`
- Read: `GET /api/crime-reports/:id`
- Create: `POST /api/crime-reports`
- Update: `PUT /api/crime-reports/:id`
- Delete: `DELETE /api/crime-reports/:id`
- Related workflow operations:
  - Link report to crime: `POST /api/crime-reports/:id/link`
  - Create and manage accepted crimes: `/api/crimes/*`

### Workflow 2: Investigation Management with Suspect and Evidence Tracking
Primary Entity: `Investigation` (full CRUD)
- List: `GET /api/investigations`
- Read: `GET /api/investigations/:id`
- Create: `POST /api/investigations`
- Update: `PUT /api/investigations/:id`
- Delete: `DELETE /api/investigations/:id`
- Related workflow operations:
  - Suspect CRUD: `/api/suspects/*`
  - Evidence CRUD + chain updates: `/api/evidence/*`, `POST /api/evidence/:id/chain`
  - Link crimes to investigations: `POST /api/investigations/:id/crimes`

### Workflow 3: Crime Analysis and Prediction
Primary Entity Support: `Crime` (full CRUD) + analytics/prediction services
- Crime CRUD foundation:
  - List: `GET /api/crimes`
  - Read: `GET /api/crimes/:id`
  - Create: `POST /api/crimes`
  - Update: `PUT /api/crimes/:id`
  - Delete: `DELETE /api/crimes/:id`
- Analysis and prediction endpoints:
  - `/api/analytics/crime-trends`
  - `/api/analytics/hotspots`
  - `/api/analytics/patterns`
  - `/api/analytics/category-distribution`
  - `/api/analytics/officer-performance`
  - `/api/analytics/time-series`
  - `/api/predictions/risk-assessment`
  - `/api/predictions/pattern-matching`
  - `/api/predictions/forecast`

Note: Login and registration flows exist but are not counted as milestone workflows.

## Tech Stack
- Backend: Node.js, Express.js
- Database: Oracle Database
- Auth: JWT + role-based middleware
- Password hashing: bcryptjs

## Backend Architecture
- Routes layer: API URL definitions and HTTP method mapping
- Controller layer: request validation and response handling
- Service/data layer (`models/`): SQL queries, DB operations, stored procedure calls

## Features

### Authentication
- Officer login/signup
- Victim login/signup
- Witness login/signup
- JWT-based authentication
- Role-based access control: OFFICER, VICTIM, WITNESS

### Core CRUD Modules
- Crimes
- Crime Reports
- Suspects
- Evidence
- Locations
- Crime Types
- Investigations
- Officers
- Victim Profile
- Witness Profile

### Advanced Database Features
- Window functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, cumulative windows)
- Complex joins for multi-entity retrieval
- Stored procedures:
  - `sp_create_crime_report`
  - `sp_assign_investigation`
  - `sp_calculate_crime_statistics`
  - `sp_predict_crime_risk`
  - `sp_update_evidence_chain`
- Triggers for validation and automation
- Sequences for PK generation
- Indexes for query performance

### Analytics and Predictions
- Crime trends
- Hotspots
- Patterns by day/time
- Category distribution
- Officer performance
- Time series aggregation
- Risk assessment
- Pattern matching
- Trend forecasting

## Project Structure

```text
backend/
|- .env.example
|- .gitignore
|- app.js
|- check-witness-table.sql
|- cpas_data_generator.py
|- package-lock.json
|- package.json
|- README.md
|- test-constraint.js
|- test-login.js
|- test-next-investigation.js
|- test-witness-link.js
|- config/
|  |- db.js
|- controllers/
|  |- analyticsController.js
|  |- authController.js
|  |- crimeController.js
|  |- crimeReportController.js
|  |- crimeTypeController.js
|  |- evidenceController.js
|  |- investigationController.js
|  |- locationController.js
|  |- officerController.js
|  |- predictionController.js
|  |- suspectController.js
|  |- victimController.js
|  |- witnessController.js
|- middlewares/
|  |- authMiddleware.js
|  |- roleMiddleware.js
|- models/
|  |- AnalyticsModel.js
|  |- CrimeModel.js
|  |- CrimeReportModel.js
|  |- CrimeTypeModel.js
|  |- EvidenceModel.js
|  |- InvestigationModel.js
|  |- LocationModel.js
|  |- OfficerModel.js
|  |- PredictionModel.js
|  |- SuspectModel.js
|  |- VictimModel.js
|  |- WitnessModel.js
|- routes/
|  |- analyticsRoutes.js
|  |- authRoutes.js
|  |- crimeRoutes.js
|  |- crimeReportRoutes.js
|  |- crimeTypeRoutes.js
|  |- evidenceRoutes.js
|  |- investigationRoutes.js
|  |- locationRoutes.js
|  |- officerRoutes.js
|  |- predictionRoutes.js
|  |- suspectRoutes.js
|  |- victimRoutes.js
|  |- witnessRoutes.js
|- scripts/
|  |- check-db-connection.js
|  |- check_service_tables.py
|  |- fix-existing-passwords.js
|  |- populate-passwords-sql.sql
|  |- populate-passwords.js
|  |- populate-sample-data.sql
|  |- README.md
|  |- setup-victim-witness-credentials.js
|  |- set-victim-witness-passwords.py
|- postman/
|  |- APIs.postman_collection.json
|  |- CPAS.postman_collection.json
|  |- CPAS_Complete_Test_Collection.json
|  |- FIXES_APPLIED.md
|  |- MANUAL_TESTING_GUIDE.md
|  |- QUICK_FIX.md
|  |- README_POSTMAN_TESTS.md
|  |- TROUBLESHOOTING.md
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env` in `backend/` (copy from `.env.example`):
```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=localhost:1521/xe
JWT_SECRET=replace_with_a_secure_random_string
PORT=5000
NODE_ENV=development
DB_POOL_MIN=1
DB_POOL_MAX=10
DB_POOL_INCREMENT=1
```

If your Oracle service is different, update `DB_CONNECTION_STRING` accordingly.

### 3. Verify DB connectivity
```bash
npm run db:check
```

### 4. Database setup
Run schema, procedures, and triggers in Oracle SQL Developer/SQL*Plus.

Recommended order:
1. Main schema SQL (tables, constraints, sequences, views)
2. Auth/schema update SQL (email/password fields if not in main schema)
3. Stored procedures SQL
4. Triggers SQL

### 5. Run backend
```bash
npm run dev
```
Or:
```bash
npm start
```

### 6. Populate sample data
```bash
C:\Python314\python.exe cpas_data_generator.py
```

## API Base URL
`http://localhost:5000/api`

## Endpoint Summary

### Authentication
- `POST /auth/officer/signup`
- `POST /auth/officer/login`
- `POST /auth/victim/signup`
- `POST /auth/victim/login`
- `POST /auth/witness/signup`
- `POST /auth/witness/login`

### Crimes
- `GET /crimes`
- `GET /crimes/:id`
- `POST /crimes`
- `PUT /crimes/:id`
- `DELETE /crimes/:id`
- `POST /crimes/:id/suspects`
- `POST /crimes/:id/victims`
- `POST /crimes/:id/witnesses`

### Crime Reports
- `GET /crime-reports`
- `GET /crime-reports/:id`
- `POST /crime-reports`
- `PUT /crime-reports/:id`
- `POST /crime-reports/:id/link`
- `DELETE /crime-reports/:id`

### Suspects
- `GET /suspects`
- `GET /suspects/:id`
- `POST /suspects`
- `PUT /suspects/:id`
- `DELETE /suspects/:id`

### Evidence
- `GET /evidence`
- `GET /evidence/:id`
- `POST /evidence`
- `PUT /evidence/:id`
- `POST /evidence/:id/chain`
- `DELETE /evidence/:id`

### Investigations
- `GET /investigations`
- `GET /investigations/:id`
- `POST /investigations`
- `PUT /investigations/:id`
- `POST /investigations/:id/assign`
- `POST /investigations/:id/crimes`
- `DELETE /investigations/:id`

### Analytics
- `GET /analytics/crime-trends`
- `GET /analytics/hotspots`
- `GET /analytics/patterns`
- `GET /analytics/category-distribution`
- `GET /analytics/officer-performance`
- `GET /analytics/time-series`
- `GET /analytics/statistics`

### Predictions
- `POST /predictions/risk-assessment`
- `POST /predictions/pattern-matching`
- `GET /predictions/forecast`

## Detailed API Documentation (Request Formats and Examples)

All examples below use base URL:
`http://localhost:5000/api`

### Common Headers

For authenticated endpoints:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 1. Authentication

#### Officer Login
- Method: `POST`
- Route: `/auth/officer/login`
- Request body example:

```json
{
  "email": "ahmed.khan@police.gov.pk",
  "password": "your_password"
}
```

- Success response example:

```json
{
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "Inspector Ahmed Khan",
    "email": "ahmed.khan@police.gov.pk",
    "role": "OFFICER"
  }
}
```

### 2. Workflow 1: Crime Report Management (Full CRUD)

#### List Crime Reports
- Method: `GET`
- Route: `/crime-reports`
- Optional query params:
  - `status`
  - `victimId` (officer view)
  - `dateFrom`
  - `dateTo`
- Success response example:

```json
{
  "data": [
    {
      "REPORT_ID": 101,
      "VICTIM_ID": 5,
      "REPORTED_BY": "Ayesha Malik",
      "STATUS": "Pending Review"
    }
  ]
}
```

#### Create Crime Report
- Method: `POST`
- Route: `/crime-reports`
- Request body example:

```json
{
  "reportDetails": "Mobile snatching near market around 8 PM.",
  "reportedByName": "Ayesha Malik",
  "reportStatus": "Pending Review"
}
```

- Success response example:

```json
{
  "message": "Crime report created successfully",
  "reportId": 201
}
```

#### Update Crime Report
- Method: `PUT`
- Route: `/crime-reports/:id`
- Request body example:

```json
{
  "reportStatus": "Under Investigation",
  "reportDetails": "Reviewed by officer and moved to investigation stage."
}
```

- Success response example:

```json
{
  "message": "Crime report updated successfully"
}
```

#### Delete Crime Report
- Method: `DELETE`
- Route: `/crime-reports/:id`
- Success response example:

```json
{
  "message": "Crime report deleted successfully"
}
```

### 3. Workflow 2: Investigation Management (Full CRUD + Links)

#### List Investigations
- Method: `GET`
- Route: `/investigations`
- Optional query params:
  - `status`
  - `outcome`
  - `leadOfficerId`
- Success response example:

```json
{
  "data": [
    {
      "INVESTIGATION_ID": 12,
      "CASE_NUMBER": "INV-2026-000012",
      "STATUS": "Active",
      "OUTCOME": "Pending"
    }
  ]
}
```

#### Create Investigation
- Method: `POST`
- Route: `/investigations`
- Request body example:

```json
{
  "status": "Active",
  "outcome": "Pending",
  "notes": "Initial investigation opened"
}
```

- Success response example:

```json
{
  "message": "Investigation created successfully",
  "investigationId": 52,
  "caseNumber": "INV-2026-000052"
}
```

#### Update Investigation
- Method: `PUT`
- Route: `/investigations/:id`
- Request body example:

```json
{
  "status": "Closed",
  "outcome": "Solved",
  "notes": "Case resolved and closed"
}
```

- Success response example:

```json
{
  "message": "Investigation updated successfully"
}
```

#### Delete Investigation
- Method: `DELETE`
- Route: `/investigations/:id`
- Success response example:

```json
{
  "message": "Investigation deleted successfully"
}
```

#### Link Crime to Investigation
- Method: `POST`
- Route: `/investigations/:id/crimes`
- Request body example:

```json
{
  "crimeId": 145
}
```

### 4. Workflow 3: Crime CRUD + Analysis and Prediction

#### Create Crime
- Method: `POST`
- Route: `/crimes`
- Request body example:

```json
{
  "crimeTypeId": 2,
  "dateOccurred": "2026-04-02",
  "timeOccurred": "20:15",
  "description": "Armed robbery reported at main market.",
  "severityLevel": "Major",
  "locationId": 10,
  "status": "Open"
}
```

- Success response example:

```json
{
  "message": "Crime created successfully",
  "crimeId": 302
}
```

#### List Crimes
- Method: `GET`
- Route: `/crimes`
- Optional query params:
  - `status`
  - `crimeTypeId`
  - `locationId`
  - `dateFrom`
  - `dateTo`

#### Update Crime
- Method: `PUT`
- Route: `/crimes/:id`
- Request body example:

```json
{
  "status": "Under Investigation",
  "severityLevel": "Critical"
}
```

#### Delete Crime
- Method: `DELETE`
- Route: `/crimes/:id`

#### Analytics Example: Hotspots
- Method: `GET`
- Route: `/analytics/hotspots?limit=10`
- Success response example:

```json
{
  "data": [
    {
      "CITY": "Karachi",
      "AREA": "Lyari",
      "TOTAL_CRIMES": 48,
      "SOLVE_RATE": 37.5
    }
  ]
}
```

#### Prediction Example: Risk Assessment
- Method: `POST`
- Route: `/predictions/risk-assessment`
- Request body example:

```json
{
  "city": "Karachi",
  "area": "Lyari"
}
```

- Success response example:

```json
{
  "data": {
    "location": {
      "city": "Karachi",
      "area": "Lyari"
    },
    "risk_assessment": {
      "risk_score": 8,
      "risk_level": "HIGH"
    }
  }
}
```

### 5. Evidence CRUD (Related to Workflow 2)

#### Create Evidence
- Method: `POST`
- Route: `/evidence`
- Request body example:

```json
{
  "crimeId": 302,
  "type": "CCTV Footage",
  "description": "Video clip from shop camera",
  "dateCollected": "2026-04-03"
}
```

#### Update Chain of Custody
- Method: `POST`
- Route: `/evidence/:id/chain`
- Request body example:

```json
{
  "action": "ANALYZED",
  "notes": "Forensics lab completed initial analysis"
}
```

## Workflow Execution Order (Aligned with Project Narratives)

This section documents each workflow in execution order with concrete API calls, request payloads, and response examples.

Note on scope alignment:
- Frontend handles notification display and milestone messaging in Milestone 3.
- Backend email dispatch and file attachment upload pipeline are planned for a future phase.

### Workflow 1: Victim Crime Reporting, Officer Review, and Investigation Initiation

#### Step 1: Victim registers (if new)
- Method: `POST`
- Endpoint: `/api/auth/victim/signup`
- Request:

```json
{
  "name": "Ayesha Malik",
  "age": 27,
  "gender": "Female",
  "contactInfo": "0300-1234567",
  "address": "Block 7, Gulshan, Karachi",
  "email": "ayesha.malik@example.com",
  "password": "StrongPass123"
}
```

- Response:

```json
{
  "message": "Victim account created successfully"
}
```

#### Step 2: Victim logs in
- Method: `POST`
- Endpoint: `/api/auth/victim/login`
- Request:

```json
{
  "email": "ayesha.malik@example.com",
  "password": "StrongPass123"
}
```

- Response:

```json
{
  "token": "<victim_jwt>",
  "user": {
    "id": 15,
    "name": "Ayesha Malik",
    "email": "ayesha.malik@example.com",
    "role": "VICTIM"
  }
}
```

#### Step 3: Victim submits crime report
- Method: `POST`
- Endpoint: `/api/crime-reports`
- Headers: `Authorization: Bearer <victim_jwt>`
- Request:

```json
{
  "reportDetails": "Mobile snatching near Tariq Road at around 8:15 PM.",
  "reportedByName": "Ayesha Malik",
  "reportStatus": "Pending Review"
}
```

- Response:

```json
{
  "message": "Crime report created successfully",
  "reportId": 310
}
```

#### Step 4: Officer logs in and lists pending reports
- Method: `POST`
- Endpoint: `/api/auth/officer/login`
- Method: `GET`
- Endpoint: `/api/crime-reports?status=Pending%20Review`
- Headers: `Authorization: Bearer <officer_jwt>`

#### Step 5: Officer reads one report for review
- Method: `GET`
- Endpoint: `/api/crime-reports/:id`
- Headers: `Authorization: Bearer <officer_jwt>`

#### Step 6A: Officer rejects report
- Method: `PUT`
- Endpoint: `/api/crime-reports/:id`
- Request:

```json
{
  "reportStatus": "Rejected",
  "reportDetails": "Insufficient detail for verification."
}
```

- Response:

```json
{
  "message": "Crime report updated successfully"
}
```

#### Step 6B: Officer accepts and initiates investigation (current backend sequence)

Current backend performs this as multi-call orchestration:

1. Create crime
- Method: `POST`
- Endpoint: `/api/crimes`
- Request:

```json
{
  "crimeTypeId": 2,
  "dateOccurred": "2026-04-03",
  "timeOccurred": "20:15",
  "description": "Accepted from report #310",
  "status": "Open",
  "severityLevel": "Major",
  "locationId": 10
}
```

2. Link report to crime
- Method: `POST`
- Endpoint: `/api/crime-reports/:id/link`
- Request:

```json
{
  "crimeId": 420,
  "notes": "Linked during officer acceptance"
}
```

3. Create investigation
- Method: `POST`
- Endpoint: `/api/investigations`
- Request:

```json
{
  "status": "Active",
  "outcome": "Pending",
  "notes": "Investigation created from accepted report"
}
```

4. Link crime to investigation
- Method: `POST`
- Endpoint: `/api/investigations/:id/crimes`
- Request:

```json
{
  "crimeId": 420
}
```

5. Update report status
- Method: `PUT`
- Endpoint: `/api/crime-reports/:id`
- Request:

```json
{
  "reportStatus": "Under Investigation"
}
```

#### Workflow 1 scope notes
- Attachment upload (photos/videos/documents) is frontend-planned and not implemented as backend file API in this milestone.
- Notification and email dispatch are frontend/UI milestone scope; backend email dispatch is planned future work.

### Workflow 2: Investigation Management, Suspect Tracking, and Evidence Chain of Custody

#### Step 1: Officer lists active investigations
- Method: `GET`
- Endpoint: `/api/investigations?status=Active`
- Headers: `Authorization: Bearer <officer_jwt>`

#### Step 2: Officer opens investigation case details
- Method: `GET`
- Endpoint: `/api/investigations/:id`

#### Step 3: Officer searches/creates suspect
- Search suspects:
  - Method: `GET`
  - Endpoint: `/api/suspects?searchName=Ali&status=At%20Large`
- Create suspect:
  - Method: `POST`
  - Endpoint: `/api/suspects`
  - Request:

```json
{
  "name": "Ali Raza",
  "gender": "Male",
  "age": 31,
  "address": "Korangi, Karachi",
  "criminalRecord": true,
  "status": "At Large"
}
```

#### Step 4: Link suspect to crime
- Method: `POST`
- Endpoint: `/api/crimes/:id/suspects`
- Request:

```json
{
  "suspectId": 88,
  "role": "Primary Suspect",
  "arrestStatus": "Pending"
}
```

#### Step 5: Add evidence
- Method: `POST`
- Endpoint: `/api/evidence`
- Request:

```json
{
  "crimeId": 420,
  "type": "CCTV Footage",
  "description": "Camera clip from nearby shop",
  "dateCollected": "2026-04-04"
}
```

#### Step 6: Update evidence chain of custody
- Method: `POST`
- Endpoint: `/api/evidence/:id/chain`
- Request:

```json
{
  "action": "TRANSFERRED",
  "notes": "Transferred to forensic lab"
}
```

#### Step 7: Add/link witness statement
- Link witness to crime:
  - Method: `POST`
  - Endpoint: `/api/crimes/:id/witnesses`
  - Request:

```json
{
  "witnessId": 40,
  "statementDate": "2026-04-04",
  "statementText": "Saw suspect escaping on motorcycle",
  "isKeyWitness": 1
}
```

#### Step 8: Update investigation progress/outcome
- Method: `PUT`
- Endpoint: `/api/investigations/:id`
- Request:

```json
{
  "status": "Closed",
  "outcome": "Solved",
  "closeDate": "2026-04-15",
  "notes": "Suspect arrested and case closed"
}
```

### Workflow 3: Crime Analysis and Predictive Policing

#### Step 1: Officer opens hotspot analysis
- Method: `GET`
- Endpoint: `/api/analytics/hotspots?limit=10`
- Response (example):

```json
{
  "data": [
    {
      "CITY": "Karachi",
      "AREA": "Lyari",
      "TOTAL_CRIMES": 48,
      "SOLVE_RATE": 37.5
    }
  ]
}
```

#### Step 2: Officer checks trends by year/month/type
- Method: `GET`
- Endpoint: `/api/analytics/crime-trends?year=2026&month=4&crimeTypeId=2`

#### Step 3: Officer checks day/time patterns
- Method: `GET`
- Endpoint: `/api/analytics/patterns`

#### Step 4: Officer checks category distribution
- Method: `GET`
- Endpoint: `/api/analytics/category-distribution`

#### Step 5: Officer checks officer performance
- Method: `GET`
- Endpoint: `/api/analytics/officer-performance`

#### Step 6: Officer gets risk assessment for area
- Method: `POST`
- Endpoint: `/api/predictions/risk-assessment`
- Request:

```json
{
  "city": "Karachi",
  "area": "Lyari"
}
```

#### Step 7: Officer finds similar patterns
- Method: `POST`
- Endpoint: `/api/predictions/pattern-matching`
- Request:

```json
{
  "crimeType": "Armed Robbery",
  "city": "Karachi",
  "area": "Lyari",
  "dayOfWeek": "Friday"
}
```

#### Step 8: Officer forecasts upcoming crime trends
- Method: `GET`
- Endpoint: `/api/predictions/forecast?months=6&city=Karachi&area=Lyari`

#### Step 9: Officer gets chart-ready time series
- Method: `GET`
- Endpoint: `/api/analytics/time-series?groupBy=MONTH&startDate=2025-01-01&endDate=2026-12-31`

## Auth and Response Format
- Protected routes require JWT in header:
  - `Authorization: Bearer <token>`
- Standard success format:
  - `{ "data": ... }` or `{ "message": "..." }`
- Standard error format:
  - `{ "message": "...", "error": "..." }`


## Version Control Guidance (Recommended)
Suggested commit sequence:
1. `docs(readme): align with CMAS and milestone-3 workflow coverage`
2. `chore(db): harden Oracle pool initialization and env validation`
3. `feat(tools): add db connection check script and npm db:check command`
4. `fix(data-gen): align generator with schema constraints and service`

## Important Notes
- CMAS name should be used consistently in submission text.
- Use your actual Oracle service name in `.env` (`xe` in your current setup).
- Keep `.env` private and never commit secrets.
- Scope clarification (Milestone 3): Notification display and milestone update messaging are handled in the frontend layer. Backend email/notification dispatch service is planned for a future phase and is outside the current milestone scope.

---
Built for CMAS (Crime Management Analysis System)
