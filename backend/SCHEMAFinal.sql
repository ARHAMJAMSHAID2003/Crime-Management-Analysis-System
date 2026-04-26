-- =====================================================
-- ORACLE SCHEMA FOR CPAS
-- =====================================================

-- Drop existing tables (in reverse order due to dependencies)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Witness CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Suspect CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Victim CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Investigation_Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Report_Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Report CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Evidence CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Investigation CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Witness CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Victim CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Suspect CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Officer CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Location CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Type CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- Drop sequences if they exist
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_type_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE location_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE officer_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE suspect_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE victim_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE witness_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE investigation_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE evidence_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_report_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- =====================================================
-- CREATE SEQUENCES (Oracle's AUTO_INCREMENT equivalent)
-- =====================================================

CREATE SEQUENCE crime_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE location_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE officer_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE suspect_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE victim_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE witness_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE investigation_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE crime_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE evidence_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE crime_report_seq START WITH 1 INCREMENT BY 1;

-- =====================================================
-- TABLE: Crime_Type
-- =====================================================

CREATE TABLE Crime_Type (
  Crime_Type_ID NUMBER PRIMARY KEY,
  Type_Name VARCHAR2(100) NOT NULL UNIQUE,
  Category VARCHAR2(20) NOT NULL CHECK (Category IN ('Violent', 'Property', 'Cyber', 'White_Collar', 'Drug_Related', 'Other')),
  Description CLOB
);

-- =====================================================
-- TABLE: Location
-- =====================================================

CREATE TABLE Location (
  Location_ID NUMBER PRIMARY KEY,
  City VARCHAR2(100) NOT NULL,
  Area VARCHAR2(100),
  Street VARCHAR2(200),
  Latitude NUMBER(10,8),
  Longitude NUMBER(11,8)
);

CREATE INDEX idx_city_area ON Location(City, Area);

-- =====================================================
-- TABLE: Officer
-- =====================================================

CREATE TABLE Officer (
  Officer_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Contact_No VARCHAR2(20),
  Email VARCHAR2(100) UNIQUE 
);

-- =====================================================
-- TABLE: Suspect
-- =====================================================

CREATE TABLE Suspect (
  Suspect_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Gender VARCHAR2(20) CHECK (Gender IN ('Male', 'Female', 'Other', 'Unknown')),
  Age NUMBER CHECK (Age > 0),
  Address CLOB,
  Criminal_Record NUMBER(1) DEFAULT 0 CHECK (Criminal_Record IN (0, 1)),
  Status VARCHAR2(20) DEFAULT 'Unknown' CHECK (Status IN ('At Large', 'Arrested', 'Released', 'Unknown'))
);

CREATE INDEX idx_status ON Suspect(Status);

-- =====================================================
-- TABLE: Victim
-- =====================================================

CREATE TABLE Victim (
  Victim_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Age NUMBER CHECK (Age > 0),
  Gender VARCHAR2(20) CHECK (Gender IN ('Male', 'Female', 'Other', 'Unknown')),
  Contact_Info VARCHAR2(200),
  Address CLOB
);

-- =====================================================
-- TABLE: Witness
-- =====================================================

CREATE TABLE Witness (
  Witness_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Contact_Info VARCHAR2(200),
  Address CLOB
);

-- =====================================================
-- TABLE: Investigation
-- =====================================================

CREATE TABLE Investigation (
  Investigation_ID NUMBER PRIMARY KEY,
  Case_Number VARCHAR2(50) NOT NULL UNIQUE,
  Lead_Officer_ID NUMBER,
  Start_Date DATE NOT NULL,
  Close_Date DATE,
  Status VARCHAR2(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Closed', 'Suspended', 'Cold Case')),
  Outcome VARCHAR2(20) DEFAULT 'Pending' CHECK (Outcome IN ('Solved', 'Unsolved', 'No Crime', 'Pending')),
  Notes CLOB,
  CONSTRAINT fk_Investigation_Officer FOREIGN KEY (Lead_Officer_ID) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL
);

CREATE INDEX idx_inv_status ON Investigation(Status);
CREATE INDEX idx_case_number ON Investigation(Case_Number);

-- =====================================================
-- TABLE: Crime
-- =====================================================

CREATE TABLE Crime (
  Crime_ID NUMBER PRIMARY KEY,
  Crime_Type_ID NUMBER NOT NULL,
  Date_Reported DATE NOT NULL,
  Date_Occurred DATE NOT NULL,
  Time_Occurred TIMESTAMP,
  Day_Of_Week VARCHAR2(20) CHECK (Day_Of_Week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  Description CLOB,
  Status VARCHAR2(30) DEFAULT 'Open' CHECK (Status IN ('Open', 'Under Investigation', 'Closed')),
  Severity_Level VARCHAR2(20) CHECK (Severity_Level IN ('Minor', 'Moderate', 'Major', 'Critical')),
  Location_ID NUMBER,
  Officer_ID NUMBER,
  Related_Crime_ID NUMBER,
  CONSTRAINT fk_Crime_Crime_Type FOREIGN KEY (Crime_Type_ID) 
    REFERENCES Crime_Type(Crime_Type_ID),
  CONSTRAINT fk_Crime_Location FOREIGN KEY (Location_ID) 
    REFERENCES Location(Location_ID) ON DELETE SET NULL,
  CONSTRAINT fk_Crime_Officer FOREIGN KEY (Officer_ID) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL,
  CONSTRAINT fk_Crime_Related FOREIGN KEY (Related_Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE SET NULL
);

CREATE INDEX idx_crime_type ON Crime(Crime_Type_ID);
CREATE INDEX idx_date_occurred ON Crime(Date_Occurred);
CREATE INDEX idx_crime_status ON Crime(Status);
CREATE INDEX idx_location ON Crime(Location_ID);

-- =====================================================
-- TABLE: Evidence
-- =====================================================

CREATE TABLE Evidence (
  Evidence_ID NUMBER PRIMARY KEY,
  Crime_ID NUMBER NOT NULL,
  Type VARCHAR2(20) CHECK (Type IN ('Fingerprint', 'Weapon', 'CCTV Footage', 'DNA', 'Document', 'Digital', 'Other')),
  Description CLOB,
  Collected_By NUMBER,
  Date_Collected DATE,
  CONSTRAINT fk_Evidence_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Evidence_Officer FOREIGN KEY (Collected_By) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL
);

CREATE INDEX idx_evidence_crime ON Evidence(Crime_ID);
CREATE INDEX idx_evidence_type ON Evidence(Type);

-- =====================================================
-- TABLE: Crime_Report
-- =====================================================

CREATE TABLE Crime_Report (
  Report_ID NUMBER PRIMARY KEY,
  Reported_By_Victim_ID NUMBER,
  Reported_By_Name VARCHAR2(150),
  Date_Reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  Report_Details CLOB NOT NULL,
  Report_Status VARCHAR2(30) DEFAULT 'Pending Review' CHECK (Report_Status IN ('Pending Review', 'Under Investigation', 'Resolved', 'Rejected')),
  CONSTRAINT fk_Crime_Report_Victim FOREIGN KEY (Reported_By_Victim_ID) 
    REFERENCES Victim(Victim_ID) ON DELETE SET NULL
);

CREATE INDEX idx_date_reported ON Crime_Report(Date_Reported);

-- =====================================================
-- TABLE: Report_Crime (Bridge Table)
-- =====================================================

CREATE TABLE Report_Crime (
  Report_ID NUMBER NOT NULL,
  Crime_ID NUMBER NOT NULL,
  Link_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Notes CLOB,
  PRIMARY KEY (Report_ID, Crime_ID),
  CONSTRAINT fk_Report_Crime_Report FOREIGN KEY (Report_ID) 
    REFERENCES Crime_Report(Report_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Report_Crime_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Investigation_Crime (Bridge Table)
-- =====================================================

CREATE TABLE Investigation_Crime (
  Investigation_ID NUMBER NOT NULL,
  Crime_ID NUMBER NOT NULL,
  Link_Date DATE DEFAULT SYSDATE,
  PRIMARY KEY (Investigation_ID, Crime_ID),
  CONSTRAINT fk_Investigation_Crime_Inv FOREIGN KEY (Investigation_ID) 
    REFERENCES Investigation(Investigation_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Investigation_Crime_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Victim (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Victim (
  Crime_ID NUMBER NOT NULL,
  Victim_ID NUMBER NOT NULL,
  Injury_Severity VARCHAR2(20) DEFAULT 'Unknown' CHECK (Injury_Severity IN ('None', 'Minor', 'Serious', 'Fatal', 'Unknown')),
  PRIMARY KEY (Crime_ID, Victim_ID),
  CONSTRAINT fk_Crime_Victim_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Victim_Victim FOREIGN KEY (Victim_ID) 
    REFERENCES Victim(Victim_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Suspect (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Suspect (
  Crime_ID NUMBER NOT NULL,
  Suspect_ID NUMBER NOT NULL,
  Role VARCHAR2(30) DEFAULT 'Person of Interest' CHECK (Role IN ('Primary Suspect', 'Accomplice', 'Person of Interest')),
  Arrest_Status VARCHAR2(20) DEFAULT 'Pending' CHECK (Arrest_Status IN ('Pending', 'Arrested', 'Released', 'Cleared')),
  PRIMARY KEY (Crime_ID, Suspect_ID),
  CONSTRAINT fk_Crime_Suspect_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Suspect_Suspect FOREIGN KEY (Suspect_ID) 
    REFERENCES Suspect(Suspect_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Witness (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Witness (
  Crime_ID NUMBER NOT NULL,
  Witness_ID NUMBER NOT NULL,
  Statement_Date DATE,
  Statement_Text CLOB,
  Is_Key_Witness NUMBER(1) DEFAULT 0 CHECK (Is_Key_Witness IN (0, 1)),
  PRIMARY KEY (Crime_ID, Witness_ID),
  CONSTRAINT fk_Crime_Witness_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Witness_Witness FOREIGN KEY (Witness_ID) 
    REFERENCES Witness(Witness_ID) ON DELETE CASCADE
);

-- =====================================================
-- TRIGGERS FOR AUTO-INCREMENT (replacing MySQL AUTO_INCREMENT)
-- =====================================================

CREATE OR REPLACE TRIGGER crime_type_bir
BEFORE INSERT ON Crime_Type
FOR EACH ROW
BEGIN
  IF :NEW.Crime_Type_ID IS NULL THEN
    SELECT crime_type_seq.NEXTVAL INTO :NEW.Crime_Type_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER location_bir
BEFORE INSERT ON Location
FOR EACH ROW
BEGIN
  IF :NEW.Location_ID IS NULL THEN
    SELECT location_seq.NEXTVAL INTO :NEW.Location_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER officer_bir
BEFORE INSERT ON Officer
FOR EACH ROW
BEGIN
  IF :NEW.Officer_ID IS NULL THEN
    SELECT officer_seq.NEXTVAL INTO :NEW.Officer_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER suspect_bir
BEFORE INSERT ON Suspect
FOR EACH ROW
BEGIN
  IF :NEW.Suspect_ID IS NULL THEN
    SELECT suspect_seq.NEXTVAL INTO :NEW.Suspect_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER victim_bir
BEFORE INSERT ON Victim
FOR EACH ROW
BEGIN
  IF :NEW.Victim_ID IS NULL THEN
    SELECT victim_seq.NEXTVAL INTO :NEW.Victim_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER witness_bir
BEFORE INSERT ON Witness
FOR EACH ROW
BEGIN
  IF :NEW.Witness_ID IS NULL THEN
    SELECT witness_seq.NEXTVAL INTO :NEW.Witness_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER investigation_bir
BEFORE INSERT ON Investigation
FOR EACH ROW
BEGIN
  IF :NEW.Investigation_ID IS NULL THEN
    SELECT investigation_seq.NEXTVAL INTO :NEW.Investigation_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER crime_bir
BEFORE INSERT ON Crime
FOR EACH ROW
BEGIN
  IF :NEW.Crime_ID IS NULL THEN
    SELECT crime_seq.NEXTVAL INTO :NEW.Crime_ID FROM DUAL;
  END IF;
  
  -- Auto-populate Day_Of_Week
  IF :NEW.Day_Of_Week IS NULL THEN
    :NEW.Day_Of_Week := TO_CHAR(:NEW.Date_Occurred, 'Day');
  END IF;
  
  -- Validate dates
  IF :NEW.Date_Reported < :NEW.Date_Occurred THEN
    RAISE_APPLICATION_ERROR(-20001, 'Date_Reported cannot be before Date_Occurred');
  END IF;
END;
/

CREATE OR REPLACE TRIGGER evidence_bir
BEFORE INSERT ON Evidence
FOR EACH ROW
BEGIN
  IF :NEW.Evidence_ID IS NULL THEN
    SELECT evidence_seq.NEXTVAL INTO :NEW.Evidence_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER crime_report_bir
BEFORE INSERT ON Crime_Report
FOR EACH ROW
BEGIN
  IF :NEW.Report_ID IS NULL THEN
    SELECT crime_report_seq.NEXTVAL INTO :NEW.Report_ID FROM DUAL;
  END IF;
END;
/

-- =====================================================
-- VIEWS FOR ANALYTICAL QUERIES
-- =====================================================

CREATE OR REPLACE VIEW Crime_Trends_Monthly AS
SELECT 
    ct.Type_Name AS Crime_Type,
    c.Location_ID,
    l.City,
    l.Area,
    EXTRACT(MONTH FROM c.Date_Occurred) AS Month,
    EXTRACT(YEAR FROM c.Date_Occurred) AS Year,
    COUNT(*) AS Total_Crimes
FROM Crime c
JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
LEFT JOIN Location l ON c.Location_ID = l.Location_ID
GROUP BY ct.Type_Name, c.Location_ID, l.City, l.Area, EXTRACT(MONTH FROM c.Date_Occurred), EXTRACT(YEAR FROM c.Date_Occurred);

CREATE OR REPLACE VIEW Crime_Patterns_Weekly AS
SELECT 
    ct.Type_Name AS Crime_Type,
    c.Day_Of_Week,
    COUNT(*) AS Total_Incidents,
    AVG(EXTRACT(HOUR FROM c.Time_Occurred)) AS Avg_Hour_Of_Day
FROM Crime c
JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
WHERE c.Day_Of_Week IS NOT NULL
GROUP BY ct.Type_Name, c.Day_Of_Week;

CREATE OR REPLACE VIEW Crime_Hotspots AS
SELECT 
    l.Location_ID,
    l.City,
    l.Area,
    l.Street,
    COUNT(c.Crime_ID) AS Total_Crimes,
    SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Solved_Cases,
    ROUND(SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.Crime_ID), 2) AS Solve_Rate
FROM Location l
LEFT JOIN Crime c ON l.Location_ID = c.Location_ID
GROUP BY l.Location_ID, l.City, l.Area, l.Street
HAVING COUNT(c.Crime_ID) > 0
ORDER BY Total_Crimes DESC;

COMMIT;-- =====================================================
-- ORACLE SCHEMA FOR CPAS
-- =====================================================

-- Drop existing tables (in reverse order due to dependencies)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Witness CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Suspect CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Victim CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Investigation_Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Report_Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Report CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Evidence CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Investigation CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Witness CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Victim CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Suspect CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Officer CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Location CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE Crime_Type CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- Drop sequences if they exist
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_type_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE location_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE officer_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE suspect_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE victim_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE witness_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE investigation_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE evidence_seq';
   EXECUTE IMMEDIATE 'DROP SEQUENCE crime_report_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- =====================================================
-- CREATE SEQUENCES (Oracle's AUTO_INCREMENT equivalent)
-- =====================================================

CREATE SEQUENCE crime_type_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE location_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE officer_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE suspect_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE victim_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE witness_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE investigation_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE crime_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE evidence_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE crime_report_seq START WITH 1 INCREMENT BY 1;

-- =====================================================
-- TABLE: Crime_Type
-- =====================================================

CREATE TABLE Crime_Type (
  Crime_Type_ID NUMBER PRIMARY KEY,
  Type_Name VARCHAR2(100) NOT NULL UNIQUE,
  Category VARCHAR2(20) NOT NULL CHECK (Category IN ('Violent', 'Property', 'Cyber', 'White-Collar', 'Drug-Related', 'Other')),
  Description CLOB
);

-- =====================================================
-- TABLE: Location
-- =====================================================

CREATE TABLE Location (
  Location_ID NUMBER PRIMARY KEY,
  City VARCHAR2(100) NOT NULL,
  Area VARCHAR2(100),
  Street VARCHAR2(200),
  Latitude NUMBER(10,8),
  Longitude NUMBER(11,8)
);

CREATE INDEX idx_city_area ON Location(City, Area);

-- =====================================================
-- TABLE: Officer
-- =====================================================

CREATE TABLE Officer (
  Officer_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Contact_No VARCHAR2(20),
  Email VARCHAR2(100)
);

-- =====================================================
-- TABLE: Suspect
-- =====================================================

CREATE TABLE Suspect (
  Suspect_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Gender VARCHAR2(20) CHECK (Gender IN ('Male', 'Female', 'Other', 'Unknown')),
  Age NUMBER CHECK (Age > 0),
  Address CLOB,
  Criminal_Record NUMBER(1) DEFAULT 0 CHECK (Criminal_Record IN (0, 1)),
  Status VARCHAR2(20) DEFAULT 'Unknown' CHECK (Status IN ('At Large', 'Arrested', 'Released', 'Unknown'))
);

CREATE INDEX idx_status ON Suspect(Status);

-- =====================================================
-- TABLE: Victim
-- =====================================================

CREATE TABLE Victim (
  Victim_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Age NUMBER CHECK (Age > 0),
  Gender VARCHAR2(20) CHECK (Gender IN ('Male', 'Female', 'Other', 'Unknown')),
  Contact_Info VARCHAR2(200),
  Address CLOB
);

-- =====================================================
-- TABLE: Witness
-- =====================================================

CREATE TABLE Witness (
  Witness_ID NUMBER PRIMARY KEY,
  Name VARCHAR2(150) NOT NULL,
  Contact_Info VARCHAR2(200),
  Address CLOB
);

-- =====================================================
-- TABLE: Investigation
-- =====================================================

CREATE TABLE Investigation (
  Investigation_ID NUMBER PRIMARY KEY,
  Case_Number VARCHAR2(50) NOT NULL UNIQUE,
  Lead_Officer_ID NUMBER,
  Start_Date DATE NOT NULL,
  Close_Date DATE,
  Status VARCHAR2(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Closed', 'Suspended', 'Cold Case')),
  Outcome VARCHAR2(20) DEFAULT 'Pending' CHECK (Outcome IN ('Solved', 'Unsolved', 'No Crime', 'Pending')),
  Notes CLOB,
  CONSTRAINT fk_Investigation_Officer FOREIGN KEY (Lead_Officer_ID) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL
);

CREATE INDEX idx_inv_status ON Investigation(Status);

select * from Suspect;

-- =====================================================
-- TABLE: Crime
-- =====================================================

CREATE TABLE Crime (
  Crime_ID NUMBER PRIMARY KEY,
  Crime_Type_ID NUMBER NOT NULL,
  Date_Reported DATE NOT NULL,
  Date_Occurred DATE NOT NULL,
  Time_Occurred TIMESTAMP,
  Day_Of_Week VARCHAR2(20) CHECK (Day_Of_Week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  Description CLOB,
  Status VARCHAR2(30) DEFAULT 'Open' CHECK (Status IN ('Open', 'Under Investigation', 'Closed')),
  Severity_Level VARCHAR2(20) CHECK (Severity_Level IN ('Minor', 'Moderate', 'Major', 'Critical')),
  Location_ID NUMBER,
  Officer_ID NUMBER,
  Related_Crime_ID NUMBER,
  CONSTRAINT fk_Crime_Crime_Type FOREIGN KEY (Crime_Type_ID) 
    REFERENCES Crime_Type(Crime_Type_ID),
  CONSTRAINT fk_Crime_Location FOREIGN KEY (Location_ID) 
    REFERENCES Location(Location_ID) ON DELETE SET NULL,
  CONSTRAINT fk_Crime_Officer FOREIGN KEY (Officer_ID) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL,
  CONSTRAINT fk_Crime_Related FOREIGN KEY (Related_Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE SET NULL
);

CREATE INDEX idx_crime_type ON Crime(Crime_Type_ID);
CREATE INDEX idx_date_occurred ON Crime(Date_Occurred);
CREATE INDEX idx_crime_status ON Crime(Status);
CREATE INDEX idx_location ON Crime(Location_ID);

-- =====================================================
-- TABLE: Evidence
-- =====================================================

CREATE TABLE Evidence (
  Evidence_ID NUMBER PRIMARY KEY,
  Crime_ID NUMBER NOT NULL,
  Type VARCHAR2(20) CHECK (Type IN ('Fingerprint', 'Weapon', 'CCTV Footage', 'DNA', 'Document', 'Digital', 'Other')),
  Description CLOB,
  Collected_By NUMBER,
  Date_Collected DATE,
  CONSTRAINT fk_Evidence_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Evidence_Officer FOREIGN KEY (Collected_By) 
    REFERENCES Officer(Officer_ID) ON DELETE SET NULL
);

CREATE INDEX idx_evidence_crime ON Evidence(Crime_ID);
CREATE INDEX idx_evidence_type ON Evidence(Type);

-- =====================================================
-- TABLE: Crime_Report
-- =====================================================

CREATE TABLE Crime_Report (
  Report_ID NUMBER PRIMARY KEY,
  Reported_By_Victim_ID NUMBER,
  Reported_By_Name VARCHAR2(150),
  Date_Reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  Report_Details CLOB NOT NULL,
  Report_Status VARCHAR2(30) DEFAULT 'Pending Review' CHECK (Report_Status IN ('Pending Review', 'Under Investigation', 'Resolved', 'Rejected')),
  CONSTRAINT fk_Crime_Report_Victim FOREIGN KEY (Reported_By_Victim_ID) 
    REFERENCES Victim(Victim_ID) ON DELETE SET NULL
);

CREATE INDEX idx_date_reported ON Crime_Report(Date_Reported);

-- =====================================================
-- TABLE: Report_Crime (Bridge Table)
-- =====================================================

CREATE TABLE Report_Crime (
  Report_ID NUMBER NOT NULL,
  Crime_ID NUMBER NOT NULL,
  Link_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Notes CLOB,
  PRIMARY KEY (Report_ID, Crime_ID),
  CONSTRAINT fk_Report_Crime_Report FOREIGN KEY (Report_ID) 
    REFERENCES Crime_Report(Report_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Report_Crime_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Investigation_Crime (Bridge Table)
-- =====================================================

CREATE TABLE Investigation_Crime (
  Investigation_ID NUMBER NOT NULL,
  Crime_ID NUMBER NOT NULL,
  Link_Date DATE DEFAULT SYSDATE,
  PRIMARY KEY (Investigation_ID, Crime_ID),
  CONSTRAINT fk_Investigation_Crime_Inv FOREIGN KEY (Investigation_ID) 
    REFERENCES Investigation(Investigation_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Investigation_Crime_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Victim (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Victim (
  Crime_ID NUMBER NOT NULL,
  Victim_ID NUMBER NOT NULL,
  Injury_Severity VARCHAR2(20) DEFAULT 'Unknown' CHECK (Injury_Severity IN ('None', 'Minor', 'Serious', 'Fatal', 'Unknown')),
  PRIMARY KEY (Crime_ID, Victim_ID),
  CONSTRAINT fk_Crime_Victim_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Victim_Victim FOREIGN KEY (Victim_ID) 
    REFERENCES Victim(Victim_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Suspect (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Suspect (
  Crime_ID NUMBER NOT NULL,
  Suspect_ID NUMBER NOT NULL,
  Role VARCHAR2(30) DEFAULT 'Person of Interest' CHECK (Role IN ('Primary Suspect', 'Accomplice', 'Person of Interest')),
  Arrest_Status VARCHAR2(20) DEFAULT 'Pending' CHECK (Arrest_Status IN ('Pending', 'Arrested', 'Released', 'Cleared')),
  PRIMARY KEY (Crime_ID, Suspect_ID),
  CONSTRAINT fk_Crime_Suspect_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Suspect_Suspect FOREIGN KEY (Suspect_ID) 
    REFERENCES Suspect(Suspect_ID) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: Crime_Witness (Bridge Table)
-- =====================================================

CREATE TABLE Crime_Witness (
  Crime_ID NUMBER NOT NULL,
  Witness_ID NUMBER NOT NULL,
  Statement_Date DATE,
  Statement_Text CLOB,
  Is_Key_Witness NUMBER(1) DEFAULT 0 CHECK (Is_Key_Witness IN (0, 1)),
  PRIMARY KEY (Crime_ID, Witness_ID),
  CONSTRAINT fk_Crime_Witness_Crime FOREIGN KEY (Crime_ID) 
    REFERENCES Crime(Crime_ID) ON DELETE CASCADE,
  CONSTRAINT fk_Crime_Witness_Witness FOREIGN KEY (Witness_ID) 
    REFERENCES Witness(Witness_ID) ON DELETE CASCADE
);

-- =====================================================
-- TRIGGERS FOR AUTO-INCREMENT (replacing MySQL AUTO_INCREMENT)
-- =====================================================

CREATE OR REPLACE TRIGGER crime_type_bir
BEFORE INSERT ON Crime_Type
FOR EACH ROW
BEGIN
  IF :NEW.Crime_Type_ID IS NULL THEN
    SELECT crime_type_seq.NEXTVAL INTO :NEW.Crime_Type_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER location_bir
BEFORE INSERT ON Location
FOR EACH ROW
BEGIN
  IF :NEW.Location_ID IS NULL THEN
    SELECT location_seq.NEXTVAL INTO :NEW.Location_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER officer_bir
BEFORE INSERT ON Officer
FOR EACH ROW
BEGIN
  IF :NEW.Officer_ID IS NULL THEN
    SELECT officer_seq.NEXTVAL INTO :NEW.Officer_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER suspect_bir
BEFORE INSERT ON Suspect
FOR EACH ROW
BEGIN
  IF :NEW.Suspect_ID IS NULL THEN
    SELECT suspect_seq.NEXTVAL INTO :NEW.Suspect_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER victim_bir
BEFORE INSERT ON Victim
FOR EACH ROW
BEGIN
  IF :NEW.Victim_ID IS NULL THEN
    SELECT victim_seq.NEXTVAL INTO :NEW.Victim_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER witness_bir
BEFORE INSERT ON Witness
FOR EACH ROW
BEGIN
  IF :NEW.Witness_ID IS NULL THEN
    SELECT witness_seq.NEXTVAL INTO :NEW.Witness_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER investigation_bir
BEFORE INSERT ON Investigation
FOR EACH ROW
BEGIN
  IF :NEW.Investigation_ID IS NULL THEN
    SELECT investigation_seq.NEXTVAL INTO :NEW.Investigation_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER crime_bir
BEFORE INSERT ON Crime
FOR EACH ROW
BEGIN
  IF :NEW.Crime_ID IS NULL THEN
    SELECT crime_seq.NEXTVAL INTO :NEW.Crime_ID FROM DUAL;
  END IF;
  
  -- Auto-populate Day_Of_Week
  IF :NEW.Day_Of_Week IS NULL THEN
    :NEW.Day_Of_Week := TO_CHAR(:NEW.Date_Occurred, 'Day');
  END IF;
  
  -- Validate dates
  IF :NEW.Date_Reported < :NEW.Date_Occurred THEN
    RAISE_APPLICATION_ERROR(-20001, 'Date_Reported cannot be before Date_Occurred');
  END IF;
END;
/

CREATE OR REPLACE TRIGGER evidence_bir
BEFORE INSERT ON Evidence
FOR EACH ROW
BEGIN
  IF :NEW.Evidence_ID IS NULL THEN
    SELECT evidence_seq.NEXTVAL INTO :NEW.Evidence_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER crime_report_bir
BEFORE INSERT ON Crime_Report
FOR EACH ROW
BEGIN
  IF :NEW.Report_ID IS NULL THEN
    SELECT crime_report_seq.NEXTVAL INTO :NEW.Report_ID FROM DUAL;
  END IF;
END;
/

-- =====================================================
-- VIEWS FOR ANALYTICAL QUERIES
-- =====================================================

CREATE OR REPLACE VIEW Crime_Trends_Monthly AS
SELECT 
    ct.Type_Name AS Crime_Type,
    c.Location_ID,
    l.City,
    l.Area,
    EXTRACT(MONTH FROM c.Date_Occurred) AS Month,
    EXTRACT(YEAR FROM c.Date_Occurred) AS Year,
    COUNT(*) AS Total_Crimes
FROM Crime c
JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
LEFT JOIN Location l ON c.Location_ID = l.Location_ID
GROUP BY ct.Type_Name, c.Location_ID, l.City, l.Area, EXTRACT(MONTH FROM c.Date_Occurred), EXTRACT(YEAR FROM c.Date_Occurred);

CREATE OR REPLACE VIEW Crime_Patterns_Weekly AS
SELECT 
    ct.Type_Name AS Crime_Type,
    c.Day_Of_Week,
    COUNT(*) AS Total_Incidents,
    AVG(EXTRACT(HOUR FROM c.Time_Occurred)) AS Avg_Hour_Of_Day
FROM Crime c
JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
WHERE c.Day_Of_Week IS NOT NULL
GROUP BY ct.Type_Name, c.Day_Of_Week;

CREATE OR REPLACE VIEW Crime_Hotspots AS
SELECT 
    l.Location_ID,
    l.City,
    l.Area,
    l.Street,
    COUNT(c.Crime_ID) AS Total_Crimes,
    SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Solved_Cases,
    ROUND(SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.Crime_ID), 2) AS Solve_Rate
FROM Location l
LEFT JOIN Crime c ON l.Location_ID = c.Location_ID
GROUP BY l.Location_ID, l.City, l.Area, l.Street
HAVING COUNT(c.Crime_ID) > 0
ORDER BY Total_Crimes DESC;





ALTER TABLE Officer ADD (Password VARCHAR2(255));

-- Add password to Victim table
ALTER TABLE Victim ADD (Password VARCHAR2(255));

-- Add password to Witness table
ALTER TABLE Witness ADD (Password VARCHAR2(255));

-- Add email to Victim table if not exists (for login)
ALTER TABLE Victim ADD (Email VARCHAR2(100));

-- Add email to Witness table if not exists (for login)
ALTER TABLE Witness ADD (Email VARCHAR2(100));

-- Create indexes for faster login lookups

CREATE INDEX idx_victim_email ON Victim(Email);
CREATE INDEX idx_witness_email ON Witness(Email);

CREATE OR REPLACE PROCEDURE sp_create_crime_report(
    p_victim_id IN NUMBER,
    p_reported_by_name IN VARCHAR2,
    p_report_details IN CLOB,
    p_crime_type_id IN NUMBER,
    p_date_occurred IN DATE,
    p_location_id IN NUMBER,
    p_report_id OUT NUMBER,
    p_crime_id OUT NUMBER
) AS
BEGIN
    -- Insert crime report
    INSERT INTO Crime_Report (Reported_By_Victim_ID, Reported_By_Name, Report_Details, Report_Status)
    VALUES (p_victim_id, p_reported_by_name, p_report_details, 'Pending Review')
    RETURNING Report_ID INTO p_report_id;
    
    -- Auto-create crime from report
    INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Status, Location_ID)
    VALUES (p_crime_type_id, SYSDATE, p_date_occurred, 'Open', p_location_id)
    RETURNING Crime_ID INTO p_crime_id;
    
    -- Link report to crime
    INSERT INTO Report_Crime (Report_ID, Crime_ID, Notes)
    VALUES (p_report_id, p_crime_id, 'Auto-linked from crime report');
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure: Assign Investigation to Officer
CREATE OR REPLACE PROCEDURE sp_assign_investigation(
    p_investigation_id IN NUMBER,
    p_officer_id IN NUMBER,
    p_status OUT VARCHAR2
) AS
    v_case_number VARCHAR2(50);
BEGIN
    -- Get case number
    SELECT Case_Number INTO v_case_number
    FROM Investigation
    WHERE Investigation_ID = p_investigation_id;
    
    -- Update investigation
    UPDATE Investigation
    SET Lead_Officer_ID = p_officer_id,
        Status = 'Active',
        Notes = NVL(Notes, '') || ' | Assigned to officer: ' || TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI')
    WHERE Investigation_ID = p_investigation_id;
    
    p_status := 'SUCCESS';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := 'ERROR: ' || SQLERRM;
        RAISE;
END;
/

-- Procedure: Calculate Crime Statistics
CREATE OR REPLACE PROCEDURE sp_calculate_crime_statistics(
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_stats OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_stats FOR
        SELECT 
            ct.Category,
            COUNT(*) AS Total_Crimes,
            SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Solved_Crimes,
            ROUND(SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS Solve_Rate,
            AVG(CASE WHEN c.Severity_Level = 'Critical' THEN 1 ELSE 0 END) * 100 AS Critical_Percentage
        FROM Crime c
        JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
        WHERE c.Date_Occurred BETWEEN p_start_date AND p_end_date
        GROUP BY ct.Category
        ORDER BY Total_Crimes DESC;
END;
/

-- Procedure: Predict Crime Risk for Location
CREATE OR REPLACE PROCEDURE sp_predict_crime_risk(
    p_location_id IN NUMBER,
    p_risk_score OUT NUMBER,
    p_risk_level OUT VARCHAR2
) AS
    v_crime_count NUMBER;
    v_recent_crimes NUMBER;
    v_solve_rate NUMBER;
BEGIN
    -- Get total crimes at location
    SELECT COUNT(*) INTO v_crime_count
    FROM Crime
    WHERE Location_ID = p_location_id;
    
    -- Get recent crimes (last 30 days)
    SELECT COUNT(*) INTO v_recent_crimes
    FROM Crime
    WHERE Location_ID = p_location_id
    AND Date_Occurred >= SYSDATE - 30;
    
    -- Get solve rate
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND(SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)
            ELSE 0
        END INTO v_solve_rate
    FROM Crime
    WHERE Location_ID = p_location_id;
    
    -- Calculate risk score (0-100)
    p_risk_score := LEAST(100, (v_crime_count * 2) + (v_recent_crimes * 10) + (100 - v_solve_rate));
    
    -- Determine risk level
    IF p_risk_score >= 70 THEN
        p_risk_level := 'HIGH';
    ELSIF p_risk_score >= 40 THEN
        p_risk_level := 'MEDIUM';
    ELSE
        p_risk_level := 'LOW';
    END IF;
END;
/

-- Procedure: Update Evidence Chain of Custody
CREATE OR REPLACE PROCEDURE sp_update_evidence_chain(
    p_evidence_id IN NUMBER,
    p_officer_id IN NUMBER,
    p_action IN VARCHAR2, -- 'COLLECTED', 'TRANSFERRED', 'ANALYZED'
    p_notes IN CLOB
) AS
BEGIN
    -- Update evidence collected_by if action is COLLECTED
    IF p_action = 'COLLECTED' THEN
        UPDATE Evidence
        SET Collected_By = p_officer_id,
            Date_Collected = SYSDATE,
            Description = NVL(Description, '') || ' | ' || p_notes
        WHERE Evidence_ID = p_evidence_id;
    ELSE
        -- For other actions, just update description
        UPDATE Evidence
        SET Description = NVL(Description, '') || ' | ' || p_action || ' by Officer ' || p_officer_id || ' on ' || TO_CHAR(SYSDATE, 'DD-MON-YYYY') || ': ' || p_notes
        WHERE Evidence_ID = p_evidence_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
-- Trigger: Audit Crime Reports Changes
CREATE OR REPLACE TRIGGER trg_audit_crime_reports
AFTER INSERT OR UPDATE OR DELETE ON Crime_Report
FOR EACH ROW
DECLARE
    v_action VARCHAR2(10);
BEGIN
    IF INSERTING THEN
        v_action := 'INSERT';
        -- Log can be stored in an audit table if needed
        DBMS_OUTPUT.PUT_LINE('Crime Report ' || :NEW.Report_ID || ' created');
    ELSIF UPDATING THEN
        v_action := 'UPDATE';
        DBMS_OUTPUT.PUT_LINE('Crime Report ' || :OLD.Report_ID || ' updated');
    ELSIF DELETING THEN
        v_action := 'DELETE';
        DBMS_OUTPUT.PUT_LINE('Crime Report ' || :OLD.Report_ID || ' deleted');
    END IF;
END;
/

-- Trigger: Auto-update Crime Statistics when new crime is reported
CREATE OR REPLACE TRIGGER trg_update_crime_statistics
AFTER INSERT ON Crime
FOR EACH ROW
BEGIN
    -- This trigger can be used to update materialized views or cache statistics
    -- For now, we'll just log the event
    DBMS_OUTPUT.PUT_LINE('New crime ' || :NEW.Crime_ID || ' reported. Statistics may need update.');
    
    -- If crime is Critical severity, could trigger notification
    IF :NEW.Severity_Level = 'Critical' THEN
        DBMS_OUTPUT.PUT_LINE('ALERT: Critical crime reported!');
    END IF;
END;
/

-- Trigger: Notify when high-priority crime is reported
CREATE OR REPLACE TRIGGER trg_notify_high_priority_crime
AFTER INSERT ON Crime
FOR EACH ROW
WHEN (NEW.Severity_Level = 'Critical' OR NEW.Severity_Level = 'Major')
BEGIN
    -- In a real system, this would send notifications
    -- For now, we'll just log
    DBMS_OUTPUT.PUT_LINE('HIGH PRIORITY: Crime ' || :NEW.Crime_ID || ' requires immediate attention');
    DBMS_OUTPUT.PUT_LINE('Crime Type: ' || :NEW.Crime_Type_ID || ', Location: ' || :NEW.Location_ID);
END;
/

-- Trigger: Validate Suspect Data before insertion
CREATE OR REPLACE TRIGGER trg_validate_suspect_data
BEFORE INSERT OR UPDATE ON Suspect
FOR EACH ROW
BEGIN
    -- Validate age if provided
    IF :NEW.Age IS NOT NULL AND (:NEW.Age < 0 OR :NEW.Age > 150) THEN
        RAISE_APPLICATION_ERROR(-20001, 'Invalid age: Age must be between 0 and 150');
    END IF;
    
    -- Validate status
    IF :NEW.Status NOT IN ('At Large', 'Arrested', 'Released', 'Unknown') THEN
        RAISE_APPLICATION_ERROR(-20002, 'Invalid status: Must be At Large, Arrested, Released, or Unknown');
    END IF;
END;
/

-- Trigger: Maintain Evidence Integrity
CREATE OR REPLACE TRIGGER trg_maintain_evidence_integrity
BEFORE DELETE ON Evidence
FOR EACH ROW
DECLARE
    v_linked_investigations NUMBER;
BEGIN
    -- Check if evidence is linked to active investigations
    SELECT COUNT(*) INTO v_linked_investigations
    FROM Investigation_Crime ic
    JOIN Crime c ON ic.Crime_ID = c.Crime_ID
    WHERE c.Crime_ID = :OLD.Crime_ID
    AND EXISTS (
        SELECT 1 FROM Investigation i
        WHERE i.Investigation_ID = ic.Investigation_ID
        AND i.Status = 'Active'
    );
    
    IF v_linked_investigations > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 
            'Cannot delete evidence: Linked to ' || v_linked_investigations || ' active investigation(s)');
    END IF;
END;
/

-- Trigger: Auto-update Investigation Status when all crimes are closed
CREATE OR REPLACE TRIGGER trg_auto_update_investigation_status
AFTER UPDATE OF Status ON Crime
FOR EACH ROW
DECLARE
    v_investigation_id NUMBER;
    v_open_crimes NUMBER;
BEGIN
    -- Check if this crime is part of any investigation
    SELECT Investigation_ID INTO v_investigation_id
    FROM (
        SELECT Investigation_ID
        FROM Investigation_Crime
        WHERE Crime_ID = :NEW.Crime_ID
        AND ROWNUM = 1
    );
    
    IF v_investigation_id IS NOT NULL THEN
        -- Count open crimes in this investigation
        SELECT COUNT(*) INTO v_open_crimes
        FROM Investigation_Crime ic
        JOIN Crime c ON ic.Crime_ID = c.Crime_ID
        WHERE ic.Investigation_ID = v_investigation_id
        AND c.Status != 'Closed';
        
        -- If all crimes are closed, update investigation
        IF v_open_crimes = 0 THEN
            UPDATE Investigation
            SET Status = 'Closed',
                Outcome = 'Solved',
                Close_Date = SYSDATE
            WHERE Investigation_ID = v_investigation_id;
        END IF;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        NULL; -- Crime not linked to investigation, ignore
    WHEN OTHERS THEN
        NULL; -- Ignore errors in trigger
END;
/

-- Trigger: Validate Crime Dates
CREATE OR REPLACE TRIGGER trg_validate_crime_dates
BEFORE INSERT OR UPDATE ON Crime
FOR EACH ROW
BEGIN
    -- Ensure date reported is not before date occurred
    IF :NEW.Date_Reported < :NEW.Date_Occurred THEN
        RAISE_APPLICATION_ERROR(-20004, 
            'Date_Reported cannot be before Date_Occurred');
    END IF;
    
    -- Ensure date occurred is not in the future
    IF :NEW.Date_Occurred > SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20005, 
            'Date_Occurred cannot be in the future');
    END IF;
END;
/
SELECT * FROM Suspect WHERE Suspect_ID = 1822;



SELECT * FROM Crime_Report;


COMMIT;