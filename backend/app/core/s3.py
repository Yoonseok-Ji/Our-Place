import boto3
from botocore.exceptions import ClientError
from ..config import settings


def _client():
    # EC2 IAM Instance Role 자동 사용 (액세스 키 불필요)
    return boto3.client("s3", region_name=settings.AWS_REGION)


def upload_to_s3(file_bytes: bytes, key: str, content_type: str) -> str:
    """Upload bytes to S3 and return the public URL."""
    _client().put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def delete_from_s3(image_url: str) -> None:
    """Delete an object from S3 given its full URL. Silently ignores missing objects."""
    prefix = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/"
    if not image_url.startswith(prefix):
        return
    key = image_url[len(prefix):]
    try:
        _client().delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
    except ClientError:
        pass
