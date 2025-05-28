import boto3
import os
import sys
import json

# Usage: python list_user_files_dynamodb.py <user_id>
if len(sys.argv) < 2:
    print("Usage: python list_user_files_dynamodb.py <user_id>")
    sys.exit(1)

user_id = sys.argv[1]

table_name = os.environ.get("AWS_DYNAMODB_TABLE")
region = os.environ.get("AWS_REGION", "us-east-2")

if not table_name:
    print("AWS_DYNAMODB_TABLE environment variable not set!")
    sys.exit(1)

dynamodb = boto3.resource('dynamodb', region_name=region)
table = dynamodb.Table(table_name)

# Query for all files with the given user_id
response = table.scan(
    FilterExpression='user_id = :uid',
    ExpressionAttributeValues={':uid': user_id}
)

items = response.get('Items', [])

print(json.dumps(items, indent=2, default=str))
print(f"\nFound {len(items)} files for user_id={user_id}")

if items:
    print("\n--- File IDs and 'text' field status for all records ---")
    valid_count = 0
    for idx, record in enumerate(items):
        file_id = record.get('file_id', f'index_{idx}')
        has_text = ('text' in record and bool(record['text']))
        print(f"[{idx}] file_id: {file_id} | text present: {has_text}")
        if not has_text:
            print(f"    [DEBUG] Record missing/empty 'text': {json.dumps(record, indent=2, default=str)}")
        else:
            valid_count += 1
    print(f"\nTotal records: {len(items)} | Valid for embedding: {valid_count} | Skipped: {len(items) - valid_count}")
else:
    print("No files found for this user.")
