import boto3
import json
from botocore.exceptions import ClientError
from typing import Dict, List, Optional
import os
from pathlib import Path
from dotenv import load_dotenv
import uuid

# Load .env from parent directory
env_path = Path(__file__).parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

class AWSManager:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.dynamodb = boto3.resource('dynamodb')
        self.bucket_name = os.getenv('AWS_S3_BUCKET')
        self.table_name = os.getenv('AWS_DYNAMODB_TABLE')
        self.table = self.dynamodb.Table(self.table_name)
        
        # Log configuration (without sensitive data)
        print('AWS Configuration:')
        print('Region:', os.getenv('AWS_REGION'))
        print('S3 Bucket:', self.bucket_name)
        print('DynamoDB Table:', self.table_name)

    def upload_file_to_s3(self, file_path: str, s3_key: str) -> bool:
        """Upload a file to S3."""
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, s3_key)
            return True
        except ClientError as e:
            print(f"Error uploading file to S3: {str(e)}")
            return False

    def download_file_from_s3(self, s3_key: str, local_path: str) -> bool:
        """Download a file from S3."""
        try:
            self.s3_client.download_file(self.bucket_name, s3_key, local_path)
            return True
        except ClientError as e:
            print(f"Error downloading file from S3: {str(e)}")
            return False

    def save_metadata_to_dynamodb(self, metadata: Dict) -> bool:
        """Save file metadata to DynamoDB."""
        try:
            # Ensure required fields are present
            if 'user_id' not in metadata:
                metadata['user_id'] = 'default_user'
            if 'file_id' not in metadata:
                metadata['file_id'] = str(uuid.uuid4())
            self.table.put_item(Item=metadata)
            return True
        except ClientError as e:
            print(f"Error saving metadata to DynamoDB: {str(e)}")
            return False

    def get_metadata_from_dynamodb(self, file_id: str, user_id: str = 'default_user') -> Optional[Dict]:
        """Get file metadata from DynamoDB."""
        try:
            response = self.table.get_item(Key={
                'file_id': file_id,
                'user_id': user_id
            })
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting metadata from DynamoDB: {str(e)}")
            return None

    def check_file_exists(self, file_id: str, user_id: str = 'default_user') -> bool:
        """Check if file exists in DynamoDB."""
        metadata = self.get_metadata_from_dynamodb(file_id, user_id)
        return metadata is not None

    def list_all_files(self, user_id: str = 'default_user') -> List[Dict]:
        """List all files in DynamoDB."""
        try:
            response = self.table.query(
                KeyConditionExpression='user_id = :uid',
                ExpressionAttributeValues={
                    ':uid': user_id
                }
            )
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error listing files from DynamoDB: {str(e)}")
            return []

    def delete_file(self, file_id: str, user_id: str = 'default_user') -> bool:
        """Delete file from both S3 and DynamoDB."""
        try:
            # Get the file metadata first
            metadata = self.get_metadata_from_dynamodb(file_id, user_id)
            if not metadata:
                return False

            # Delete from S3
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=metadata['s3_key']
            )
            # Delete from DynamoDB
            self.table.delete_item(Key={
                'file_id': file_id,
                'user_id': user_id
            })
            return True
        except ClientError as e:
            print(f"Error deleting file: {str(e)}")
            return False 