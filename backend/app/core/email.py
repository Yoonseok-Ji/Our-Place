import boto3
from botocore.exceptions import ClientError
from ..config import settings


def send_verification_email(to_email: str, code: str) -> None:
    if not settings.SES_SENDER_EMAIL:
        # 개발 환경: 콘솔에 출력
        print(f"[DEV] 이메일 인증 코드 → {to_email}: {code}")
        return

    ses = boto3.client("ses", region_name=settings.AWS_REGION)
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#3182F6;margin-bottom:8px">우리들의 지도</h2>
      <p style="color:#4E5968;margin-bottom:24px">아래 6자리 인증 코드를 입력해주세요.</p>
      <div style="background:#F2F4F6;border-radius:16px;padding:24px;text-align:center">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#191F28">{code}</span>
      </div>
      <p style="color:#8B95A1;font-size:13px;margin-top:16px">5분 안에 입력해주세요. 본인이 요청하지 않았다면 무시하세요.</p>
    </div>
    """
    try:
        ses.send_email(
            Source=f"{settings.EMAIL_FROM_NAME} <{settings.SES_SENDER_EMAIL}>",
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": "[우리들의 지도] 이메일 인증 코드", "Charset": "UTF-8"},
                "Body": {"Html": {"Data": html, "Charset": "UTF-8"}},
            },
        )
    except ClientError as e:
        raise RuntimeError(f"이메일 발송 실패: {e.response['Error']['Message']}")
