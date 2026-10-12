#!/usr/bin/env python3
"""
Test connection and seed sample community questions to Firebase Realtime Database
"""
import urllib.request
import urllib.error
import json
import time

DATABASE_URL = "https://devops-vault-d1ac9-default-rtdb.asia-southeast1.firebasedatabase.app"

SAMPLE_QUESTIONS = [
    {
        "author": "shriram",
        "tag": "Kubernetes",
        "question": "what is CICD",
        "timestamp": "Today",
        "createdAt": int(time.time() * 1000) - 3600000,
        "upvotes": 5,
        "replies": [
            {
                "author": "DevOps Architect",
                "text": "CI/CD stands for Continuous Integration & Continuous Delivery/Deployment. CI automates building and testing code on commit. CD automates deploying validated code to staging/production environments.",
                "timestamp": "Just now",
                "createdAt": int(time.time() * 1000) - 1800000
            }
        ]
    },
    {
        "author": "Priya_Cloud",
        "tag": "Terraform",
        "question": "How do you resolve state drift in Terraform across large teams?",
        "timestamp": "Yesterday",
        "createdAt": int(time.time() * 1000) - 86400000,
        "upvotes": 8,
        "replies": [
            {
                "author": "Terraform Guru",
                "text": "Use remote backend with S3 + DynamoDB state locking, run automated terraform plan checks in CI/CD, and schedule drift-detection pipelines.",
                "timestamp": "Yesterday",
                "createdAt": int(time.time() * 1000) - 80000000
            }
        ]
    }
]

def check_and_seed():
    print(f"[*] Testing connection to: {DATABASE_URL} ...")
    
    # 1. Test Read
    read_url = f"{DATABASE_URL}/community_doubts.json"
    req_get = urllib.request.Request(read_url, method="GET")
    
    try:
        with urllib.request.urlopen(req_get) as resp:
            data = resp.read().decode('utf-8')
            print(f"[✓] READ SUCCESS! Database responded (HTTP {resp.status})")
            print(f"    Current data: {data[:100]}...")
    except urllib.error.HTTPError as e:
        print(f"[✗] READ FAILED: HTTP {e.code} ({e.reason})")
        print(f"    Firebase Server message: {e.read().decode().strip()}")
        print("\n    --> Firebase Rules are currently denying read access.")
        print("    --> In Firebase Console -> Realtime Database -> Rules:")
        print('    --> Change to: { "rules": { ".read": true, ".write": true } } and click Publish.\n')
        return False
    except Exception as ex:
        print(f"[✗] Connection error: {ex}")
        return False

    # 2. Test Write (Seed sample doubts)
    print("\n[*] Injecting test doubts into community_doubts ...")
    for q in SAMPLE_QUESTIONS:
        data_bytes = json.dumps(q).encode('utf-8')
        req_post = urllib.request.Request(
            f"{DATABASE_URL}/community_doubts.json",
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req_post) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                print(f"[✓] Added doubt: \"{q['question']}\" (ID: {result.get('name')})")
        except urllib.error.HTTPError as e:
            print(f"[✗] WRITE FAILED for \"{q['question']}\": HTTP {e.code} - {e.read().decode().strip()}")
            return False

    print("\n[🎉] SUCCESS: Test data successfully added to Firebase!")
    return True

if __name__ == "__main__":
    check_and_seed()
