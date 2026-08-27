import sqlite3, json
import sqlite3, json

DB = r"c:\Users\LENOVO THINKPAD T14\source\repos\Sedibelo International Cultural Arts Festival\pocketbase_0.39.11_windows_amd64\pb_data\data.db"
con = sqlite3.connect(DB)
cur = con.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("TABLES:", tables)

if "_collections" in tables:
    cur.execute("SELECT name, schema FROM _collections")
    for name, schema in cur.fetchall():
        print("
=== COLLECTION:", name, "===")
        try:
            s = json.loads(schema)
            for f in s:
                print("  field:", f.get("name"), "|", f.get("type"))
        except Exception as e:
            print("  (schema parse error)", e, schema[:500])

# Sample records from events if present
for t in tables:
    if t.lower() == "events":
        try:
            cur.execute(f"SELECT * FROM {t} LIMIT 5")
            cols = [d[0] for d in cur.description]
            print("
=== SAMPLE ROWS FROM", t, "===")
            print("COLUMNS:", cols)
            for row in cur.fetchall():
                print(row)
        except Exception as e:
            print("sample error:", e)

con.close()