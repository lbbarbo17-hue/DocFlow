import os
from typing import Optional
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

class R2StorageService:
    def __init__(self):
        self.account_id = os.getenv("CLOUDFLARE_R2_ACCOUNT_ID", "")
        self.access_key = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID", "")
        self.secret_key = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "")
        self.default_bucket = os.getenv("CLOUDFLARE_R2_BUCKET", "docflow-documents")
        self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        
        self.s3_client = boto3.client(
            service_name="s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="auto",
            config=Config(signature_version="s3v4")
        )

    def upload_file(
        self,
        file_bytes: bytes,
        file_path: str,
        content_type: str = "application/octet-stream",
        bucket_name: Optional[str] = None
    ) -> str:
        bucket = bucket_name or self.default_bucket
        self.s3_client.put_object(
            Bucket=bucket,
            Key=file_path,
            Body=file_bytes,
            ContentType=content_type
        )
        return file_path

    def generate_download_url(
        self,
        file_path: str,
        expiration_seconds: int = 3600,
        bucket_name: Optional[str] = None
    ) -> str:
        bucket = bucket_name or self.default_bucket
        return self.s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket, "Key": file_path},
            ExpiresIn=expiration_seconds
        )

    def delete_file(
        self,
        file_path: str,
        bucket_name: Optional[str] = None
    ) -> bool:
        bucket = bucket_name or self.default_bucket
        try:
            self.s3_client.delete_object(Bucket=bucket, Key=file_path)
            return True
        except ClientError:
            return False

    def list_buckets(self) -> list:
        response = self.s3_client.list_buckets()
        return [b["Name"] for b in response.get("Buckets", [])]
