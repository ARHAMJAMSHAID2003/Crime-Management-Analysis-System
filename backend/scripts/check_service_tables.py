import oracledb

for svc in ["xe", "xepdb1"]:
    try:
        conn = oracledb.connect(user="c##arham", password="111", dsn=f"localhost:1521/{svc}")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM user_tables WHERE table_name = 'CRIME_TYPE'")
        count = cur.fetchone()[0]
        print(f"{svc}: CRIME_TYPE present={count}")
        cur.close()
        conn.close()
    except Exception as exc:
        print(f"{svc}: ERROR {exc}")
