®
import json
import urllib.request
import urllib.error
import time

PORTS = [8001]

def create_alias(base_url):
    print("Creating sample Alias...")
    data = {
        "ecosystem": "maven",
        "canonical_name": "log4j",
        "aliases": [
            "org.apache.logging.log4j:log4j-core",
            "org.apache.logging.log4j:log4j-api",
            "log4j:log4j"
        ],
        "bidirectional": True,
        "created_by": "seed_script",
        "reason": "Initial seed data for testing",
        "ticket_reference": "https://example.com/ticket/1"
    }
    
    req = urllib.request.Request(
        f"{base_url}/aliases",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Success: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Error creating alias: {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Connection error: {e}")

def create_override(base_url):
    print("\nCreating sample Override...")
    # NOTE: In a real scenario, the vulnerability might need to exist first if validation is strict.
    # But usually override creation stores it referencing the ID.
    data = {
        "vulnerability_id": "CVE-2021-44228", # Log4Shell
        "fields": [
            {
                "path": "severity.cvss_v3_score",
                "operation": "set",
                "value": 10.0
            },
            {
                "path": "affected[ecosystem=maven,package=org.apache.logging.log4j:log4j-core].fixed",
                "operation": "set",
                "value": "2.17.1"
            }
        ],
        "created_by": "seed_script",
        "reason": "Correcting CVSS score and fixed version for Log4Shell",
        "ticket_reference": "https://example.com/ticket/2"
    }

    req = urllib.request.Request(
        f"{base_url}/overrides",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Success: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Error creating override: {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Connection error: {e}")

def check_health(port):
    url = f"http://127.0.0.1:{port}/health"
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if data.get("database") is True:
                    return True
                print(f"Port {port} healthy but no DB connection.")
    except Exception:
        pass
    return False

if __name__ == "__main__":
    target_port = None
    for port in PORTS:
        if check_health(port):
            target_port = port
            break
    
    if target_port:
        base_url = f"http://127.0.0.1:{target_port}/api/v1"
        print(f"Found healthy backend on port {target_port}. Seeding...")
        create_alias(base_url)
        create_override(base_url)
        print(f"\nSeeding complete on port {target_port}.")
    else:
        print("No healthy backend found with database connection.")
J *cascade08JN*cascade08NR *cascade08RT *cascade08TV *cascade08VW*cascade08WX *cascade08Xm *cascade08mu*cascade08uÜ *cascade08Üä*cascade08äã *cascade08ãé*cascade08é‰ *cascade08‰Ï*cascade08ÏÉ *cascade08ÉÜ*cascade08ÜŒ *cascade08Œ—*cascade08—¯ *cascade08¯¸*cascade08¸˝ *cascade08˝Ä*cascade08Ä« *cascade08«ñ *cascade08ñ∂ *cascade08∂Ω*cascade08Ωæ *cascade08æø*cascade08ø¿ *cascade08¿◊*cascade08◊Ÿ *cascade08Ÿ˜*cascade08˜¯ *cascade08¯˘*cascade08˘˙ *cascade08˙í*cascade08íì *cascade08ì∞*cascade08∞± *cascade08±ø*cascade08ø¿ *cascade08¿¡*cascade08¡ƒ *cascade08ƒ«*cascade08«» *cascade08» *cascade08 À *cascade08À“*cascade08“” *cascade08”⁄ *cascade08⁄‹*cascade08‹› *cascade08›‡*cascade08‡Ç*cascade08ÇÉ *cascade08É—*cascade08—ÿ *cascade08ÿ⁄*cascade08⁄ﬁ *cascade08ﬁ‡*cascade08‡Ì *cascade08Ìı*cascade08ı¯ *cascade08¯˙*cascade08˙˛ *cascade08˛Ä*cascade08Äê *cascade08êò*cascade08òõ *cascade08õù*cascade08ù° *cascade08°£*cascade08£© *cascade08©™*cascade08™Ω *cascade08Ω£*cascade08£® *cascade082)file:///c:/SCOUTNEW/scout_db/seed_data.py