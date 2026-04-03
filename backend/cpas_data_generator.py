import oracledb
from datetime import datetime, timedelta
import random

# ============================================
# ORACLE CONNECTION
# ============================================
def connect_oracle():
    """
    Update these connection parameters:
    - username: your Oracle username (default: system)
    - password: your Oracle password
    - dsn: typically 'localhost:1521/xe' for Oracle XE
    """
    try:
        connection = oracledb.connect(
            user='c##arham',  # Change this
            password='111',  # Change this
            dsn='localhost:1521/xe'  # Change if needed
        )
        print("✅ Connected to Oracle Database")
        return connection
    except oracledb.Error as error:
        print(f"❌ Error connecting to Oracle: {error}")
        return None

# ============================================
# GENERATE REALISTIC DATA
# ============================================

def generate_all_data():
    conn = connect_oracle()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("\n🚀 Starting enhanced realistic data generation for Oracle...\n")
    
    try:
        # Clear any uncommitted transactions first
        conn.rollback()
        
        # 1. Crime Types - More detailed and realistic
        print("📝 Checking Crime Types...")
        cursor.execute("SELECT COUNT(*) FROM Crime_Type")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Crime Types ({count} already exist)")
        else:
            print("📝 Inserting Crime Types...")
            crime_types = [
            ('Street Theft', 'Property', 'Pickpocketing and snatching in public areas'),
            ('Armed Robbery', 'Violent', 'Robbery involving firearms or weapons'),
            ('House Burglary', 'Property', 'Breaking into residential properties'),
            ('Murder', 'Violent', 'Homicide cases including domestic and gang-related'),
            ('Assault', 'Violent', 'Physical attacks ranging from minor to aggravated'),
            ('Kidnapping for Ransom', 'Violent', 'Abduction with ransom demands'),
            ('Financial Fraud', 'White-Collar', 'Bank fraud, credit card fraud, online scams'),
            ('Embezzlement', 'White-Collar', 'Employee theft and misappropriation of funds'),
            ('Cybercrime', 'Cyber', 'Hacking, phishing, and online fraud'),
            ('Identity Theft', 'Cyber', 'Stealing personal information for financial gain'),
            ('Drug Trafficking', 'Drug-Related', 'Large-scale drug distribution networks'),
            ('Drug Possession', 'Drug-Related', 'Personal drug possession cases'),
            ('Vandalism', 'Property', 'Graffiti and property damage'),
            ('Domestic Violence', 'Violent', 'Family disputes and abuse cases'),
            ('Sexual Assault', 'Violent', 'Rape and molestation cases'),
            ('Vehicle Theft', 'Property', 'Car and motorcycle theft'),
            ('Shoplifting', 'Property', 'Retail theft from stores and markets'),
            ('Money Laundering', 'White-Collar', 'Concealing illegal funds through businesses'),
            ('Arson', 'Property', 'Deliberately setting fires to property'),
            ('Extortion', 'Violent', 'Bhatta (extortion) and threatening for money')
        ]
            
            cursor.executemany(
                "INSERT INTO Crime_Type (Type_Name, Category, Description) VALUES (:1, :2, :3)",
                crime_types
            )
            conn.commit()  # Commit immediately
            print(f"✅ Inserted {len(crime_types)} crime types")
        
        # 2. Locations - Mixed high, medium, and low crime areas
        print("\n📍 Checking Locations...")
        cursor.execute("SELECT COUNT(*) FROM Location")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Locations ({count} already exist)")
        else:
            print("📍 Inserting Locations (Mixed crime rate areas)...")
            locations = [
            # KARACHI - High Crime Areas (7 locations)
            ('Karachi', 'Lyari', 'Agra Taj Colony', 24.8700, 66.9900),
            ('Karachi', 'Lyari', 'Chakiwara Road', 24.8650, 66.9950),
            ('Karachi', 'Orangi Town', 'Sector 11-L', 24.9450, 66.9800),
            ('Karachi', 'Korangi', 'Korangi Industrial Area', 24.8250, 67.1100),
            ('Karachi', 'Landhi', 'Landhi No.6', 24.8400, 67.2200),
            ('Karachi', 'Malir', 'Saudabad', 24.8900, 67.2000),
            ('Karachi', 'Baldia Town', 'Ittehad Town', 24.9200, 66.9500),
            
            # KARACHI - Medium Crime Areas (8 locations)
            ('Karachi', 'Saddar', 'Empress Market Area', 24.8550, 67.0100),
            ('Karachi', 'Gulshan-e-Iqbal', 'Block 13-D', 24.9200, 67.0900),
            ('Karachi', 'North Nazimabad', 'Block B', 24.9300, 67.0300),
            ('Karachi', 'FB Area', 'Block 16', 24.9000, 67.0700),
            ('Karachi', 'Liaquatabad', 'Block 10', 24.9100, 67.0450),
            ('Karachi', 'Shah Faisal Colony', 'Main Road', 24.8800, 67.1500),
            ('Karachi', 'Garden', 'Garden East', 24.8600, 67.0250),
            ('Karachi', 'Soldier Bazaar', 'Main Market', 24.8650, 67.0400),
            
            # KARACHI - Low Crime Areas (5 locations)
            ('Karachi', 'Clifton', 'Block 2 Sea View', 24.8100, 67.0300),
            ('Karachi', 'Defence', 'DHA Phase 6', 24.8000, 67.0500),
            ('Karachi', 'Defence', 'DHA Phase 8', 24.7950, 67.0600),
            ('Karachi', 'Gulshan-e-Iqbal', 'Block 7', 24.9150, 67.0850),
            ('Karachi', 'PECHS', 'Block 6', 24.8700, 67.0650),
            
            # LAHORE - Mixed Areas (8 locations)
            ('Lahore', 'Iqbal Town', 'Main Boulevard', 31.5050, 74.3100),
            ('Lahore', 'Johar Town', 'Block H', 31.4700, 74.2700),
            ('Lahore', 'Model Town', 'Link Road', 31.4850, 74.3200),
            ('Lahore', 'Gulberg', 'Main Market', 31.5200, 74.3500),
            ('Lahore', 'DHA', 'Phase 5', 31.4700, 74.4000),
            ('Lahore', 'Shalimar', 'Baghbanpura', 31.5950, 74.3700),
            ('Lahore', 'Township', 'Sector A', 31.4550, 74.2950),
            ('Lahore', 'Badami Bagh', 'Railway Station Area', 31.5800, 74.3200),
            
            # ISLAMABAD - Low to Medium Crime (6 locations)
            ('Islamabad', 'F-6', 'Super Market', 33.7200, 73.0550),
            ('Islamabad', 'F-7', 'Jinnah Super Market', 33.7250, 73.0600),
            ('Islamabad', 'F-10', 'Markaz', 33.6950, 73.0300),
            ('Islamabad', 'G-9', 'Markaz', 33.6900, 73.0100),
            ('Islamabad', 'I-8', 'Markaz', 33.6650, 73.0750),
            ('Islamabad', 'Blue Area', 'Jinnah Avenue', 33.7100, 73.0650),
            
            # RAWALPINDI - Medium Crime (3 locations)
            ('Rawalpindi', 'Saddar', 'Committee Chowk', 33.5950, 73.0450),
            ('Rawalpindi', 'Raja Bazaar', 'Main Market', 33.6000, 73.0550),
            ('Rawalpindi', 'Satellite Town', 'Block A', 33.6350, 73.0700),
            
            # Other Cities (5 locations)
            ('Peshawar', 'Saddar', 'Khyber Bazaar', 34.0080, 71.5785),
            ('Peshawar', 'Hayatabad', 'Phase 3', 34.0150, 71.5200),
            ('Quetta', 'Jinnah Town', 'Shahrah-e-Iqbal', 30.1840, 66.9987),
            ('Multan', 'Gulgasht Colony', 'Main Boulevard', 30.1980, 71.4687),
            ('Faisalabad', 'D-Ground', 'Ghulam Muhammad Abad', 31.4180, 73.0790),
        ]
            
            cursor.executemany(
                "INSERT INTO Location (City, Area, Street, Latitude, Longitude) VALUES (:1, :2, :3, :4, :5)",
                locations
            )
            conn.commit()  # Commit immediately
            print(f"✅ Inserted {len(locations)} locations (High/Medium/Low crime mix)")
        
        # 3. Officers - More realistic hierarchy
        print("\n👮 Checking Officers...")
        cursor.execute("SELECT COUNT(*) FROM Officer")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Officers ({count} already exist)")
        else:
            print("👮 Inserting Officers...")
            officers = [
            # Senior Inspectors
            ('Inspector Ahmed Khan', '0300-1234567', 'ahmed.khan@police.gov.pk'),
            ('Inspector Fatima Malik', '0301-2345678', 'fatima.malik@police.gov.pk'),
            ('Inspector Kamran Raza', '0306-7890123', 'kamran.raza@police.gov.pk'),
            ('Inspector Zainab Hassan', '0307-8901234', 'zainab.hassan@police.gov.pk'),
            ('Inspector Adnan Sheikh', '0312-3456789', 'adnan.sheikh@police.gov.pk'),
            
            # Sub-Inspectors
            ('SI Bilal Hussain', '0302-3456789', 'bilal.hussain@police.gov.pk'),
            ('SI Ayesha Siddiqui', '0303-4567890', 'ayesha.siddiqui@police.gov.pk'),
            ('SI Usman Tariq', '0308-9012345', 'usman.tariq@police.gov.pk'),
            ('SI Hina Aziz', '0309-0123456', 'hina.aziz@police.gov.pk'),
            ('SI Imran Yousaf', '0314-5678901', 'imran.yousaf@police.gov.pk'),
            ('SI Samina Khalid', '0315-6789012', 'samina.khalid@police.gov.pk'),
            
            # Assistant Sub-Inspectors
            ('ASI Muhammad Ali', '0304-5678901', 'muhammad.ali@police.gov.pk'),
            ('ASI Sana Ahmed', '0305-6789012', 'sana.ahmed@police.gov.pk'),
            ('ASI Farhan Majeed', '0310-1234567', 'farhan.majeed@police.gov.pk'),
            ('ASI Mariam Noor', '0311-2345678', 'mariam.noor@police.gov.pk'),
            ('ASI Rashid Mehmood', '0316-7890123', 'rashid.mehmood@police.gov.pk'),
            ('ASI Nida Zaheer', '0317-8901234', 'nida.zaheer@police.gov.pk'),
            ('ASI Hassan Rauf', '0318-9012345', 'hassan.rauf@police.gov.pk'),
            ('ASI Saima Aslam', '0319-0123456', 'saima.aslam@police.gov.pk'),
            ('ASI Zahid Iqbal', '0320-1234567', 'zahid.iqbal@police.gov.pk')
        ]
            
            cursor.executemany(
                "INSERT INTO Officer (Name, Contact_No, Email) VALUES (:1, :2, :3)",
                officers
            )
            conn.commit()  # Commit immediately
            print(f"✅ Inserted {len(officers)} officers")
        
        # 4. Suspects - More realistic profiles
        print("\n🔍 Checking Suspects...")
        cursor.execute("SELECT COUNT(*) FROM Suspect")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Suspects ({count} already exist)")
        else:
            print("🔍 Generating Suspects (Mix of profiles)...")
            suspect_profiles = [
            # Repeat Offenders - Known criminals (15 suspects)
            ('Asif "Kala" Baloch', 'Male', 32, 'Lyari, Chakiwara, Karachi', 1, 'At Large'),
            ('Rashid Gujjar', 'Male', 38, 'Orangi Town, Karachi', 1, 'Arrested'),
            ('Zahid Khan', 'Male', 29, 'Landhi, Karachi', 1, 'At Large'),
            ('Shahid Afridi (Street Name)', 'Male', 35, 'Korangi, Karachi', 1, 'Released'),
            ('Nadeem Sheikh', 'Male', 41, 'Malir, Karachi', 1, 'Arrested'),
            ('Tariq Javed', 'Male', 33, 'Lyari, Karachi', 1, 'At Large'),
            ('Wasim Ahmed', 'Male', 36, 'Baldia Town, Karachi', 1, 'Released'),
            ('Khalid Mehmood', 'Male', 28, 'Orangi Town, Karachi', 1, 'At Large'),
            ('Shazia Bibi', 'Female', 31, 'Landhi, Karachi', 1, 'Arrested'),
            ('Nazia Khatoon', 'Female', 27, 'Korangi, Karachi', 1, 'Released'),
            ('Farzana Parveen', 'Female', 34, 'Lyari, Karachi', 1, 'At Large'),
            ('Imran Butt', 'Male', 39, 'Saddar, Karachi', 1, 'Released'),
            ('Waqar Ali', 'Male', 42, 'Malir, Karachi', 1, 'Arrested'),
            ('Bilal Hassan', 'Male', 30, 'Orangi Town, Karachi', 1, 'At Large'),
            ('Ayesha Malik', 'Female', 29, 'Landhi, Karachi', 1, 'Released'),
        ]
        
        # First-time offenders - Mix of backgrounds (45 suspects)
        if count == 0:
            first_names_male = ['Ali', 'Hamza', 'Fahad', 'Junaid', 'Saad', 'Zeeshan', 'Adeel', 'Usman', 
                               'Hassan', 'Ahmad', 'Kamran', 'Faisal', 'Saqib', 'Nabeel', 'Raza']
            first_names_female = ['Sana', 'Hira', 'Maria', 'Aliya', 'Nimra', 'Sara', 'Zara', 'Amina', 
                                 'Fatima', 'Rabia', 'Hina', 'Nida', 'Mariam', 'Sadia', 'Kiran']
            last_names = ['Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Malik', 'Raza', 'Iqbal', 
                         'Mahmood', 'Yousaf', 'Aziz', 'Sheikh', 'Butt', 'Chaudhry', 'Siddiqui']
            areas_all = ['Lyari', 'Orangi Town', 'Korangi', 'Landhi', 'Gulshan', 'Defence', 'Clifton',
                         'Saddar', 'FB Area', 'North Nazimabad', 'Johar Town', 'Model Town', 'F-7', 'G-9']
            
            for i in range(45):
                gender = random.choice(['Male', 'Female'])
                if gender == 'Male':
                    name = f"{random.choice(first_names_male)} {random.choice(last_names)}"
                else:
                    name = f"{random.choice(first_names_female)} {random.choice(last_names)}"
                
                age = random.randint(18, 55) if random.random() > 0.15 else None
                address = f"{random.choice(areas_all)}, Karachi" if random.random() > 0.12 else None
                criminal_record = 0
                status = random.choice(['At Large', 'Arrested', 'Released', 'Unknown'])
                
                suspect_profiles.append((name, gender, age, address, criminal_record, status))
            
            # Suspects with incomplete information (20 suspects)
            for i in range(20):
                gender = random.choice(['Male', 'Female', 'Unknown'])
                if gender == 'Male':
                    name = f"Unknown Male Suspect #{i+1}"
                elif gender == 'Female':
                    name = f"Unknown Female Suspect #{i+1}"
                else:
                    name = f"Unidentified Suspect #{i+1}"
                
                age = random.randint(20, 50) if random.random() > 0.4 else None
                address = None if random.random() > 0.3 else f"{random.choice(areas_all)}, Karachi"
                criminal_record = random.choice([0, 1])
                status = random.choice(['At Large', 'Unknown'])
                
                suspect_profiles.append((name, gender, age, address, criminal_record, status))

            cursor.executemany(
                "INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status) VALUES (:1, :2, :3, :4, :5, :6)",
                suspect_profiles
            )
            conn.commit()  # Commit immediately
            print(f"✅ Generated {len(suspect_profiles)} suspects (Repeat offenders, first-time, unknown)")
        
        # 5. Victims - Realistic profiles
        print("\n👥 Checking Victims...")
        cursor.execute("SELECT COUNT(*) FROM Victim")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Victims ({count} already exist)")
        else:
            print("👥 Generating Victims...")
            victim_first_names_male = ['Sameer', 'Hassan', 'Imran', 'Amir', 'Kashif', 'Tariq', 'Fahad', 
                                                                        'Bilal', 'Usman', 'Ali', 'Kamran', 'Asad', 'Faisal', 'Hamza', 'Junaid']
            victim_first_names_female = ['Fatima', 'Amina', 'Zara', 'Nida', 'Sadia', 'Rabia', 'Hina', 
                                         'Mariam', 'Ayesha', 'Sara', 'Kiran', 'Aliya', 'Nimra', 'Maria', 'Sana']
            victim_last_names = ['Khan', 'Ahmed', 'Ali', 'Malik', 'Hassan', 'Siddiqui', 'Raza', 'Yousaf', 
                                'Aziz', 'Mahmood', 'Iqbal', 'Sheikh', 'Butt', 'Chaudhry', 'Hussain']
            cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Multan', 'Faisalabad']
            
            victims = []
            for i in range(100):
                gender = random.choice(['Male', 'Female'])
                if gender == 'Male':
                    name = f"{random.choice(victim_first_names_male)} {random.choice(victim_last_names)}"
                else:
                    name = f"{random.choice(victim_first_names_female)} {random.choice(victim_last_names)}"
                
                age = random.randint(18, 75)
                contact = f"03{random.randint(10,49)}-{random.randint(1000000,9999999)}"
                city = random.choice(cities)
                address = f"{random.choice(areas_all)}, {city}"
                
                victims.append((name, age, gender, contact, address))
            
            cursor.executemany(
                "INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address) VALUES (:1, :2, :3, :4, :5)",
                victims
            )
            conn.commit()  # Commit immediately
            print(f"✅ Generated {len(victims)} victims")
        
        # 6. Witnesses
        print("\n👁️ Checking Witnesses...")
        cursor.execute("SELECT COUNT(*) FROM Witness")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"⏭️  Skipping Witnesses ({count} already exist)")
        else:
            print("👁️ Generating Witnesses...")
            witness_first_names = ['Shahid', 'Younis', 'Misbah', 'Abdul', 'Saeed', 'Rashid', 'Waqar', 
                              'Mohammad', 'Inzamam', 'Mushtaq', 'Shoaib', 'Wasim', 'Zaheer', 'Azhar']
            witness_first_names_female = ['Sana', 'Bismah', 'Nida', 'Javeria', 'Asmavia', 'Sidra', 
                                          'Aliya', 'Diana', 'Fatima', 'Kainat']
            
            witnesses = []
            for i in range(70):
                if i % 4 == 0:
                    name = f"{random.choice(witness_first_names_female)} {random.choice(victim_last_names)}"
                else:
                    name = f"{random.choice(witness_first_names)} {random.choice(victim_last_names)}"
                
                contact = f"04{random.randint(10,99)}-{random.randint(1000000,9999999)}"
                city = random.choice(cities)
                address = f"{random.choice(areas_all)}, {city}"
                witnesses.append((name, contact, address))
            
            cursor.executemany(
                "INSERT INTO Witness (Name, Contact_Info, Address) VALUES (:1, :2, :3)",
                witnesses
            )
            conn.commit()  # Commit immediately
            print(f"✅ Generated {len(witnesses)} witnesses")
        
        # 7. CRIMES with ENHANCED REALISTIC PATTERNS
        print("\n🚨 Generating Crimes with enhanced realistic patterns...")
        
        # IMPORTANT: Fetch actual Crime_Type IDs from database
        cursor.execute("SELECT Crime_Type_ID, Type_Name FROM Crime_Type ORDER BY Crime_Type_ID")
        crime_type_rows = cursor.fetchall()
        
        if not crime_type_rows:
            print("❌ ERROR: No Crime Types found in database! Crime_Type table is empty.")
            print("   This means previous inserts were not committed properly.")
            raise Exception("Crime_Type table is empty. Cannot proceed with crime generation.")
        
        crime_type_mapping = {row[1]: row[0] for row in crime_type_rows}
        print(f"📋 Found {len(crime_type_mapping)} crime types in database")
        print(f"🔍 Crime Type IDs: {dict(list(crime_type_mapping.items())[:5])}...")  # Show first 5
        crime_type_ids = {
            'Street Theft': crime_type_mapping.get('Street Theft'),
            'Armed Robbery': crime_type_mapping.get('Armed Robbery'),
            'House Burglary': crime_type_mapping.get('House Burglary'),
            'Murder': crime_type_mapping.get('Murder'),
            'Assault': crime_type_mapping.get('Assault'),
            'Kidnapping for Ransom': crime_type_mapping.get('Kidnapping for Ransom'),
            'Financial Fraud': crime_type_mapping.get('Financial Fraud'),
            'Embezzlement': crime_type_mapping.get('Embezzlement'),
            'Cybercrime': crime_type_mapping.get('Cybercrime'),
            'Identity Theft': crime_type_mapping.get('Identity Theft'),
            'Drug Trafficking': crime_type_mapping.get('Drug Trafficking'),
            'Drug Possession': crime_type_mapping.get('Drug Possession'),
            'Vandalism': crime_type_mapping.get('Vandalism'),
            'Domestic Violence': crime_type_mapping.get('Domestic Violence'),
            'Sexual Assault': crime_type_mapping.get('Sexual Assault'),
            'Vehicle Theft': crime_type_mapping.get('Vehicle Theft'),
            'Shoplifting': crime_type_mapping.get('Shoplifting'),
            'Money Laundering': crime_type_mapping.get('Money Laundering'),
            'Arson': crime_type_mapping.get('Arson'),
            'Extortion': crime_type_mapping.get('Extortion')
        }
        
        print(f"📋 Found {len(crime_type_ids)} crime types in database")
        
        start_date = datetime(2024, 1, 1)
        crimes = []
        
        # Enhanced crime pattern configurations
        crime_configs = [
            # (crime_type_name, count, time_range, severity, preferred_days, location_range, description_template)
            # Violent Crimes
            ('Murder', 12, (22, 3), 'Critical', ['Friday', 'Saturday', 'Sunday'], (1, 7), 
             ['Gang-related shooting', 'Domestic dispute turned fatal', 'Armed confrontation', 'Honor killing case']),
            
            ('Armed Robbery', 25, (20, 24), 'Major', ['Friday', 'Saturday', 'Thursday'], (1, 15), 
             ['Armed robbery at gunpoint', 'Mobile snatching with weapon', 'Shop robbery', 'ATM heist']),
            
            ('Assault', 22, (19, 23), 'Moderate', ['Friday', 'Saturday', 'Sunday'], (1, 20), 
             ['Street fight', 'Bar brawl', 'Road rage incident', 'Assault during theft']),
            
            ('Kidnapping for Ransom', 8, (18, 22), 'Critical', ['Tuesday', 'Wednesday', 'Thursday'], (1, 10), 
             ['Kidnapping for ransom', 'Child abduction', 'Businessperson kidnapped']),
            
            ('Sexual Assault', 10, (21, 2), 'Critical', ['Saturday', 'Sunday'], (8, 18), 
             ['Domestic sexual assault', 'Stranger assault', 'Date rape case']),
            
            ('Domestic Violence', 15, (20, 23), 'Moderate', ['Wednesday', 'Thursday', 'Sunday', 'Monday'], (8, 20), 
             ['Husband-wife dispute', 'Family violence', 'Elder abuse', 'Child abuse case']),
            
            ('Extortion', 10, (17, 21), 'Major', ['Monday', 'Tuesday', 'Wednesday'], (1, 15), 
             ['Bhatta/extortion demand', 'Business extortion', 'Protection money demand']),
            
            # Property Crimes
            ('Street Theft', 35, (12, 19), 'Minor', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], (8, 25), 
             ['Mobile phone snatched', 'Wallet pickpocketed', 'Purse theft', 'Jewelry snatched']),
            
            ('House Burglary', 20, (2, 5), 'Major', ['Tuesday', 'Wednesday', 'Thursday'], (10, 30), 
             ['House burglary', 'Break-in during absence', 'Night burglary', 'Apartment robbery']),
            
            ('Vehicle Theft', 18, (1, 4), 'Major', ['Monday', 'Tuesday', 'Wednesday'], (8, 25), 
             ['Car stolen from parking', 'Motorcycle theft', 'Vehicle hijacking']),
            
            ('Shoplifting', 12, (14, 18), 'Minor', ['Saturday', 'Sunday', 'Friday'], (8, 20), 
             ['Shoplifting from mall', 'Market theft', 'Supermarket stealing']),
            
            ('Vandalism', 10, (10, 16), 'Minor', ['Saturday', 'Sunday'], (1, 25), 
             ['Property damage', 'Graffiti vandalism', 'Vehicle vandalism']),
            
            ('Arson', 6, (2, 4), 'Critical', ['Monday', 'Tuesday'], (1, 15), 
             ['Arson attack', 'Shop set on fire', 'Vehicle burned', 'Property fire']),
            
            # Cyber & White Collar Crimes
            ('Cybercrime', 15, (10, 18), 'Major', ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], (15, 35), 
             ['Online banking fraud', 'Email phishing', 'Social media hacking', 'E-commerce scam']),
            
            ('Identity Theft', 12, (11, 17), 'Major', ['Tuesday', 'Wednesday', 'Thursday'], (15, 30), 
             ['CNIC theft', 'Bank account fraud', 'Credit card cloning']),
            
            ('Financial Fraud', 10, (10, 16), 'Major', ['Monday', 'Tuesday', 'Wednesday'], (15, 35), 
             ['Investment fraud', 'Ponzi scheme', 'Fake job scam', 'Real estate fraud']),
            
            ('Embezzlement', 8, (9, 15), 'Major', ['Monday', 'Tuesday', 'Thursday'], (18, 35), 
             ['Company funds embezzlement', 'Employee theft', 'Accounting fraud']),
            
            ('Money Laundering', 6, (11, 16), 'Major', ['Tuesday', 'Wednesday'], (18, 35), 
             ['Money laundering through business', 'Hawala operations', 'Shell company fraud']),
            
            # Drug-Related Crimes
            ('Drug Trafficking', 12, (22, 3), 'Critical', ['Friday', 'Saturday', 'Sunday'], (1, 10), 
             ['Drug smuggling operation', 'Heroin trafficking', 'Ice/Crystal meth dealing']),
            
            ('Drug Possession', 15, (18, 23), 'Moderate', ['Thursday', 'Friday', 'Saturday'], (1, 15), 
             ['Hashish possession', 'Drug abuse case', 'Heroin possession', 'Personal use drugs']),
        ]
        
        for crime_type_name, count, time_range, severity, preferred_days, location_range, descriptions in crime_configs:
            crime_type_id = crime_type_ids.get(crime_type_name)
            
            if crime_type_id is None:
                print(f"⚠️  Warning: Crime type '{crime_type_name}' not found in database, skipping...")
                continue
                
            for _ in range(count):
                # More realistic date distribution
                if crime_type_name == 'Street Theft':  # Street theft peaks in December
                    if random.random() < 0.35:
                        days_offset = random.randint(335, 365)
                    else:
                        days_offset = random.randint(0, 330)
                elif crime_type_name in ['Drug Trafficking', 'Drug Possession']:  # Drug crimes more in summer
                    days_offset = random.randint(150, 270)
                else:
                    days_offset = random.randint(0, 300)
                
                crime_date = start_date + timedelta(days=days_offset)
                
                # Adjust to preferred day
                attempts = 0
                while crime_date.strftime('%A') not in preferred_days and attempts < 7:
                    crime_date += timedelta(days=1)
                    attempts += 1
                
                # Time based on pattern
                if time_range[1] < time_range[0]:  # Overnight
                    hour = random.choice([time_range[0], time_range[0]+1, 23, 0, 1, time_range[1]])
                else:
                    hour = random.randint(time_range[0], min(time_range[1], 23))
                
                minute = random.randint(0, 59)
                time_occurred = crime_date.replace(hour=hour, minute=minute)
                
                # Reporting delay varies by crime type
                if severity == 'Critical':
                    delay = random.randint(0, 1)
                elif severity == 'Major':
                    delay = random.randint(0, 3)
                else:
                    delay = random.randint(0, 7)
                
                date_reported = crime_date + timedelta(days=delay)
                day_of_week = crime_date.strftime('%A')
                
                location_id = random.randint(location_range[0], min(location_range[1], 45))
                officer_id = random.randint(1, 20)
                
                # Status based on time passed
                days_passed = 300 - days_offset
                if days_passed < 30:
                    status = random.choice(['Open', 'Open', 'Under Investigation'])
                elif days_passed < 90:
                    status = random.choice(['Open', 'Under Investigation', 'Under Investigation', 'Closed'])
                else:
                    status = random.choice(['Under Investigation', 'Closed', 'Closed', 'Closed'])
                
                description = random.choice(descriptions) + f" reported at location {location_id}"
                
                crimes.append((
                    crime_type_id,
                    date_reported,
                    crime_date,
                    time_occurred,
                    day_of_week,
                    description,
                    status,
                    severity,
                    location_id,
                    officer_id
                ))
        
        cursor.executemany("""
            INSERT INTO Crime (Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred, Day_Of_Week, 
                              Description, Status, Severity_Level, Location_ID, Officer_ID)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
        """, crimes)
        conn.commit()  # Commit immediately
        print(f"✅ Generated {len(crimes)} crimes with enhanced realistic patterns")
        
        # 8. Crime_Suspect relationships - More realistic
        print("\n🔗 Linking Crimes to Suspects...")
        crime_suspects = []
        for crime_id in range(1, len(crimes) + 1):
            # Different crimes have different suspect counts
            crime_type_id = crimes[crime_id-1][0]
            
            if crime_type_id in [4, 6, 15]:  # Murder, Kidnapping, Sexual Assault - fewer suspects
                num_suspects = random.choices([1, 2], weights=[80, 20])[0]
            elif crime_type_id in [2, 11, 18]:  # Armed Robbery, Drug Trafficking - gang crimes
                num_suspects = random.choices([1, 2, 3, 4], weights=[30, 40, 20, 10])[0]
            else:  # Other crimes
                num_suspects = random.choices([1, 2, 3], weights=[70, 25, 5])[0]
            
            suspect_ids = random.sample(range(1, 81), num_suspects)
            
            for idx, suspect_id in enumerate(suspect_ids):
                if idx == 0:
                    role = 'Primary Suspect'
                else:
                    role = random.choice(['Accomplice', 'Accomplice', 'Person of Interest'])
                
                # Arrest status varies by suspect criminal record
                if suspect_id <= 15:  # Known criminals
                    arrest_status = random.choice(['Arrested', 'Arrested', 'Released', 'Pending'])
                else:
                    arrest_status = random.choice(['Pending', 'Arrested', 'Released', 'Cleared'])
                
                crime_suspects.append((crime_id, suspect_id, role, arrest_status))
        
        cursor.executemany(
            "INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status) VALUES (:1, :2, :3, :4)",
            crime_suspects
        )
        print(f"✅ Linked {len(crime_suspects)} crime-suspect relationships")
        
        # 9. Crime_Victim relationships - More realistic injuries
        print("\n🔗 Linking Crimes to Victims...")
        crime_victims = []
        for crime_id in range(1, len(crimes) + 1):
            crime_type_id = crimes[crime_id-1][0]
            
            # Number of victims varies by crime type
            if crime_type_id == 4:  # Murder
                num_victims = random.choices([1, 2], weights=[90, 10])[0]
            elif crime_type_id in [2, 3, 5]:  # Armed Robbery, Burglary, Assault
                num_victims = random.choices([1, 2, 3], weights=[75, 20, 5])[0]
            else:
                num_victims = random.choices([1, 2], weights=[90, 10])[0]
            
            victim_ids = random.sample(range(1, 101), num_victims)
            
            for victim_id in victim_ids:
                # Injury severity based on crime type
                if crime_type_id == 4:  # Murder
                    injury = 'Fatal'
                elif crime_type_id in [2, 5, 6, 15]:  # Violent crimes
                    injury = random.choice(['Minor', 'Serious', 'Serious', 'Fatal'])
                elif crime_type_id in [1, 3, 16, 17]:  # Property crimes
                    injury = random.choice(['None', 'None', 'Minor'])
                else:
                    injury = random.choice(['None', 'Minor', 'Serious'])
                
                crime_victims.append((crime_id, victim_id, injury))
        
        cursor.executemany(
            "INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity) VALUES (:1, :2, :3)",
            crime_victims
        )
        print(f"✅ Linked {len(crime_victims)} crime-victim relationships")
        
        # 10. Crime_Witness relationships
        print("\n🔗 Linking Crimes to Witnesses...")
        crime_witnesses = []
        for crime_id in range(1, min(len(crimes) + 1, 151)):  # First 150 crimes
            crime_type_id = crimes[crime_id-1][0]
            
            # Witness availability varies by crime type
            if crime_type_id in [1, 2, 3, 5, 13]:  # Street crimes, property crimes
                has_witness = random.random() < 0.75  # 75% have witnesses
            elif crime_type_id in [4, 6, 15]:  # Serious crimes
                has_witness = random.random() < 0.60  # 60% have witnesses
            elif crime_type_id in [7, 8, 9, 10, 18]:  # White collar, cyber
                has_witness = random.random() < 0.30  # 30% have witnesses
            else:
                has_witness = random.random() < 0.50
            
            if has_witness:
                num_witnesses = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
                witness_ids = random.sample(range(1, 71), num_witnesses)
                
                crime_date = crimes[crime_id-1][2]
                
                for idx, witness_id in enumerate(witness_ids):
                    statement_date = crime_date + timedelta(days=random.randint(0, 15))
                    
                    # More detailed statements
                    if idx == 0:
                        statement_text = f"Eyewitness account of incident. Saw suspect fleeing the scene."
                    else:
                        statement_text = f"Supporting witness statement. Corroborates main witness account."
                    
                    is_key = 1 if idx == 0 and random.random() < 0.4 else 0
                    crime_witnesses.append((crime_id, witness_id, statement_date, statement_text, is_key))
        
        cursor.executemany("""
            INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness) 
            VALUES (:1, :2, :3, :4, :5)
        """, crime_witnesses)
        print(f"✅ Linked {len(crime_witnesses)} crime-witness relationships")
        
        # 11. Evidence - More realistic evidence collection
        print("\n📦 Generating Evidence...")
        evidence_types_by_crime = {
            1: ['CCTV Footage', 'Fingerprint', 'Mobile Phone'],  # Theft
            2: ['Weapon', 'CCTV Footage', 'Fingerprint', 'Shell Casing'],  # Armed Robbery
            3: ['Fingerprint', 'Shoe Print', 'Tool Mark', 'CCTV Footage'],  # Burglary
            4: ['Weapon', 'DNA', 'Fingerprint', 'Blood Sample', 'CCTV Footage'],  # Murder
            5: ['Medical Report', 'DNA', 'Weapon', 'Torn Clothing'],  # Assault
            6: ['Ransom Note', 'CCTV Footage', 'Phone Records', 'Vehicle'],  # Kidnapping
            7: ['Document', 'Digital', 'Bank Records', 'Email Evidence'],  # Fraud
            8: ['Document', 'Digital', 'Financial Records'],  # Embezzlement
            9: ['Digital', 'Computer', 'IP Logs', 'Email Evidence', 'Hard Drive'],  # Cybercrime
            10: ['Document', 'Digital', 'Fake ID', 'Bank Card'],  # Identity Theft
            11: ['Drugs', 'Weapon', 'Cash', 'Vehicle', 'Phone Records'],  # Drug Trafficking
            12: ['Drugs', 'Syringe', 'Pills', 'Drug Paraphernalia'],  # Drug Possession
            13: ['Photograph', 'Paint Can', 'Spray Can'],  # Vandalism
            14: ['Medical Report', 'Photograph', 'Statement'],  # Domestic Violence
            15: ['Medical Report', 'DNA', 'Clothing', 'Photograph'],  # Sexual Assault
            16: ['Vehicle', 'CCTV Footage', 'GPS Tracker', 'Keys'],  # Vehicle Theft
            17: ['CCTV Footage', 'Product', 'Receipt'],  # Shoplifting
            18: ['Bank Records', 'Document', 'Digital', 'Property Records'],  # Money Laundering
            19: ['Accelerant', 'Burn Pattern', 'CCTV Footage'],  # Arson
            20: ['Threat Letter', 'Phone Records', 'Audio Recording', 'Text Messages']  # Extortion
        }
        
        evidences = []
        allowed_evidence_types = {'Fingerprint', 'Weapon', 'CCTV Footage', 'DNA', 'Document', 'Digital', 'Other'}
        evidence_type_map = {
            'Mobile Phone': 'Digital',
            'Shell Casing': 'Other',
            'Shoe Print': 'Fingerprint',
            'Tool Mark': 'Other',
            'Blood Sample': 'DNA',
            'Medical Report': 'Document',
            'Torn Clothing': 'Other',
            'Ransom Note': 'Document',
            'Phone Records': 'Digital',
            'Vehicle': 'Other',
            'Bank Records': 'Document',
            'Email Evidence': 'Digital',
            'Financial Records': 'Document',
            'Computer': 'Digital',
            'IP Logs': 'Digital',
            'Hard Drive': 'Digital',
            'Fake ID': 'Document',
            'Bank Card': 'Document',
            'Drugs': 'Other',
            'Chemical Analysis': 'Other',
            'Graffiti Sample': 'Other',
            'Video Recording': 'Digital',
            'Clothing': 'Other',
            'Photograph': 'Digital',
            'GPS Tracker': 'Digital',
            'Keys': 'Other',
            'Product': 'Other',
            'Receipt': 'Document',
            'Property Records': 'Document',
            'Accelerant': 'Other',
            'Burn Pattern': 'Other',
            'Threat Letter': 'Document',
            'Audio Recording': 'Digital',
            'Text Messages': 'Digital'
        }
        for crime_id in range(1, min(len(crimes) + 1, 181)):  # First 180 crimes
            crime_type_id = crimes[crime_id-1][0]
            
            # Evidence count varies by crime severity
            severity = crimes[crime_id-1][7]
            if severity == 'Critical':
                num_evidence = random.choices([2, 3, 4, 5], weights=[20, 40, 30, 10])[0]
            elif severity == 'Major':
                num_evidence = random.choices([1, 2, 3, 4], weights=[20, 40, 30, 10])[0]
            else:
                num_evidence = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
            
            available_evidence = evidence_types_by_crime.get(crime_type_id, ['Other', 'Photograph', 'Document'])
            
            for i in range(num_evidence):
                evidence_type = random.choice(available_evidence)
                evidence_type = evidence_type_map.get(evidence_type, evidence_type)
                if evidence_type not in allowed_evidence_types:
                    evidence_type = 'Other'
                description = f"{evidence_type} evidence collected from crime scene #{crime_id}"
                collected_by = random.randint(1, 20)
                crime_date = crimes[crime_id-1][2]
                date_collected = crime_date + timedelta(days=random.randint(0, 5))
                evidences.append((crime_id, evidence_type, description, collected_by, date_collected))
        
        cursor.executemany("""
            INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected)
            VALUES (:1, :2, :3, :4, :5)
        """, evidences)
        print(f"✅ Generated {len(evidences)} evidence items")
        
        # 12. Investigations - More realistic investigation patterns
        print("\n🔎 Generating Investigations...")
        investigations = []
        for i in range(1, 51):  # 50 investigations
            case_number = f"INV-2024-{i:04d}"
            lead_officer = random.randint(1, 5)  # Senior inspectors lead
            start_date_inv = start_date + timedelta(days=random.randint(0, 250))
            
            # Investigation duration and status
            duration = random.randint(30, 200)
            status_rand = random.random()
            
            if status_rand < 0.30:  # 30% Closed
                status = 'Closed'
                close_date = start_date_inv + timedelta(days=duration)
                outcome = random.choice(['Solved', 'Solved', 'Solved', 'Unsolved'])
            elif status_rand < 0.50:  # 20% Active
                status = 'Active'
                close_date = None
                outcome = 'Pending'
            elif status_rand < 0.70:  # 20% Suspended
                status = 'Suspended'
                close_date = start_date_inv + timedelta(days=duration)
                outcome = 'Pending'
            else:  # 30% Cold Case
                status = 'Cold Case'
                close_date = None
                outcome = 'Unsolved'
            
            notes = f"Investigation {case_number}: {status}. Multiple leads being pursued."
            
            investigations.append((
                case_number, lead_officer, start_date_inv,
                close_date, status, outcome, notes
            ))
        
        cursor.executemany("""
            INSERT INTO Investigation (Case_Number, Lead_Officer_ID, Start_Date, Close_Date, Status, Outcome, Notes)
            VALUES (:1, :2, :3, :4, :5, :6, :7)
        """, investigations)
        print(f"✅ Generated {len(investigations)} investigations")
        
        # 13. Investigation_Crime relationships
        print("\n🔗 Linking Investigations to Crimes...")
        investigation_crimes = []
        used_crimes = set()
        
        for inv_id in range(1, 51):
            # Link related crimes to investigations
            if inv_id <= 20:  # First 20 investigations handle single crimes
                num_crimes_per_inv = 1
            else:  # Rest handle multiple related crimes
                num_crimes_per_inv = random.choices([1, 2, 3, 4, 5], weights=[30, 30, 20, 15, 5])[0]
            
            # Try to get unused crimes first
            available_crimes = [c for c in range(1, len(crimes) + 1) if c not in used_crimes]
            if len(available_crimes) >= num_crimes_per_inv:
                crime_ids = random.sample(available_crimes, num_crimes_per_inv)
            else:
                crime_ids = random.sample(range(1, len(crimes) + 1), num_crimes_per_inv)
            
            inv_start_date = investigations[inv_id-1][2]
            
            for crime_id in crime_ids:
                link_date = inv_start_date + timedelta(days=random.randint(0, 15))
                investigation_crimes.append((inv_id, crime_id, link_date))
                used_crimes.add(crime_id)
        
        cursor.executemany("""
            INSERT INTO Investigation_Crime (Investigation_ID, Crime_ID, Link_Date)
            VALUES (:1, :2, :3)
        """, investigation_crimes)
        print(f"✅ Linked {len(investigation_crimes)} investigation-crime relationships")
        
        # 14. Crime Reports - Citizen reports
        print("\n📋 Generating Crime Reports...")
        crime_reports = []
        for i in range(1, 101):  # 100 reports
            # 60% reported by victims, 40% by others
            if random.random() < 0.6:
                victim_id = random.randint(1, 100)
                reported_by_name = None
            else:
                victim_id = None
                reported_by_name = f"Citizen #{i}" if random.random() < 0.7 else "Anonymous"
            
            date_reported = start_date + timedelta(
                days=random.randint(0, 300), 
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # More detailed report descriptions
            report_types = [
                "Witnessed theft incident on street",
                "Suspicious activity in neighborhood",
                "Heard gunshots in the area",
                "Found suspicious package",
                "Vehicle stolen from parking",
                "Break-in attempt reported",
                "Harassment complaint",
                "Drug dealing activity observed",
                "Noise complaint - possible violence",
                "Missing person report"
            ]
            report_details = random.choice(report_types) + f" - Report #{i}"
            
            # Report status
            days_since_report = (datetime(2024, 10, 27) - date_reported).days
            if days_since_report < 7:
                report_status = random.choice(['Pending Review', 'Pending Review', 'Under Investigation'])
            elif days_since_report < 30:
                report_status = random.choice(['Under Investigation', 'Under Investigation', 'Resolved'])
            else:
                report_status = random.choice(['Resolved', 'Resolved', 'Resolved', 'Rejected'])
            
            crime_reports.append((victim_id, reported_by_name, date_reported, report_details, report_status))
        
        cursor.executemany("""
            INSERT INTO Crime_Report (Reported_By_Victim_ID, Reported_By_Name, Date_Reported, Report_Details, Report_Status)
            VALUES (:1, :2, :3, :4, :5)
        """, crime_reports)
        print(f"✅ Generated {len(crime_reports)} crime reports")
        
        # 15. Report_Crime relationships
        print("\n🔗 Linking Reports to Crimes...")
        report_crimes = []
        for report_id in range(1, 101):
            # 85% of reports get linked to crimes eventually
            if random.random() < 0.85:
                crime_id = random.randint(1, len(crimes))
                report_date = crime_reports[report_id-1][2]
                link_date = report_date + timedelta(days=random.randint(0, 30))
                
                notes_types = [
                    f"Report #{report_id} confirmed and linked to crime investigation",
                    f"Witness statement from report #{report_id} matches crime scene",
                    f"Report #{report_id} provided crucial lead",
                    f"Anonymous tip from report #{report_id} verified"
                ]
                notes = random.choice(notes_types)
                report_crimes.append((report_id, crime_id, link_date, notes))
        
        cursor.executemany("""
            INSERT INTO Report_Crime (Report_ID, Crime_ID, Link_Date, Notes)
            VALUES (:1, :2, :3, :4)
        """, report_crimes)
        print(f"✅ Linked {len(report_crimes)} report-crime relationships")
        
        # Commit all changes
        conn.commit()
        print("\n" + "="*70)
        print("🎉 ENHANCED DATA GENERATION COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\n📊 Summary Statistics:")
        print(f"   • Crime Types: 20 (Violent, Property, Cyber, Drug-Related, White-Collar)")
        print(f"   • Locations: 45 (Mix of High/Medium/Low crime areas)")
        print(f"   • Officers: 20 (Inspectors, SIs, ASIs)")
        print(f"   • Suspects: 80 (15 repeat offenders, 45 first-time, 20 unknown)")
        print(f"   • Victims: 100")
        print(f"   • Witnesses: 70")
        print(f"   • Crimes: {len(crimes)} (With realistic time/location patterns)")
        print(f"   • Crime-Suspect Links: {len(crime_suspects)}")
        print(f"   • Crime-Victim Links: {len(crime_victims)}")
        print(f"   • Crime-Witness Links: {len(crime_witnesses)}")
        print(f"   • Evidence Items: {len(evidences)} (Crime-specific evidence types)")
        print(f"   • Investigations: 50 (Active, Closed, Suspended, Cold Case)")
        print(f"   • Investigation-Crime Links: {len(investigation_crimes)}")
        print(f"   • Crime Reports: 100 (From victims and citizens)")
        print(f"   • Report-Crime Links: {len(report_crimes)}")
        print(f"\n✅ Database is ready with realistic, interpretable data!")
        print(f"✅ Data includes patterns for temporal, spatial, and categorical analysis")
        print(f"✅ Mix of solved/unsolved cases, repeat/first-time offenders")
        print(f"✅ Realistic injury severities, evidence types, and witness statements")
        
    except oracledb.Error as error:
        print(f"\n❌ Error during data generation: {error}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        print("\n🔒 Database connection closed.")

# ============================================
# MAIN EXECUTION
# ============================================

if __name__ == "__main__":
    print("="*70)
    print("   CPAS - Crime Pattern Analysis System")
    print("   Enhanced Realistic Oracle Database Data Generator")
    print("="*70)
    print("\n📝 This script generates realistic crime data with:")
    print("   • Mixed crime types across different categories")
    print("   • High/Medium/Low crime areas for spatial analysis")
    print("   • Temporal patterns (time, day, seasonal variations)")
    print("   • Repeat offenders vs first-time suspects")
    print("   • Realistic investigation outcomes and evidence")
    print("   • Diverse victim profiles and witness accounts")
    print("\n⚠️  Make sure to update Oracle credentials before running!")
    print("="*70 + "\n")
    
    generate_all_data()