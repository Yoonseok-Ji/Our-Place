import httpx
from ..config import settings


def _get(url: str, headers: dict = None, params: dict = None) -> dict:
    with httpx.Client(timeout=10) as client:
        r = client.get(url, headers=headers or {}, params=params or {})
        if not r.is_success:
            print(f"[OAUTH _get] {r.status_code} {url} → {r.text[:300]}")
            r.raise_for_status()
        return r.json()


def _post(url: str, data: dict = None, headers: dict = None) -> dict:
    with httpx.Client(timeout=10) as client:
        r = client.post(url, data=data or {}, headers=headers or {})
        if not r.is_success:
            print(f"[OAUTH _post] {r.status_code} {url} → {r.text[:300]}")
            r.raise_for_status()
        return r.json()


def get_kakao_user(code: str, redirect_uri: str) -> dict:
    """카카오 code → {oauth_id, email, name}"""
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.KAKAO_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "code": code,
    }
    if settings.KAKAO_CLIENT_SECRET:
        data["client_secret"] = settings.KAKAO_CLIENT_SECRET
    print(f"[KAKAO] redirect_uri={redirect_uri} | client_id={settings.KAKAO_CLIENT_ID}")
    token_res = _post("https://kauth.kakao.com/oauth/token", data=data)
    access_token = token_res.get("access_token")
    if not access_token:
        raise ValueError("카카오 토큰 발급 실패")

    user_res = _get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    kakao_account = user_res.get("kakao_account", {})
    profile = kakao_account.get("profile", {})
    return {
        "oauth_id": str(user_res["id"]),
        "email": kakao_account.get("email", ""),
        "name": profile.get("nickname", ""),
    }


def get_naver_user(code: str, state: str, redirect_uri: str) -> dict:
    """네이버 code → {oauth_id, email, name}
    Naver 토큰 교환 시 redirect_uri는 불필요 (공식 문서 기준)
    """
    token_res = _get(
        "https://nid.naver.com/oauth2.0/token",
        params={
            "grant_type": "authorization_code",
            "client_id": settings.NAVER_CLIENT_ID,
            "client_secret": settings.NAVER_CLIENT_SECRET,
            "code": code,
            "state": state,
        },
    )
    access_token = token_res.get("access_token")
    if not access_token:
        error = token_res.get("error", "unknown")
        desc  = token_res.get("error_description", "")
        raise ValueError(f"네이버 토큰 발급 실패: {error} - {desc}")

    user_res = _get(
        "https://openapi.naver.com/v1/nid/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    info = user_res.get("response", {})
    return {
        "oauth_id": info.get("id", ""),
        "email": info.get("email", ""),
        "name": info.get("name", ""),
    }


def get_google_user(code: str, redirect_uri: str) -> dict:
    """구글 code → {oauth_id, email, name}"""
    token_res = _post(
        "https://oauth2.googleapis.com/token",
        data={
            "grant_type": "authorization_code",
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "code": code,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    access_token = token_res.get("access_token")
    if not access_token:
        raise ValueError("구글 토큰 발급 실패")

    user_res = _get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return {
        "oauth_id": str(user_res["id"]),
        "email": user_res.get("email", ""),
        "name": user_res.get("name", ""),
    }
