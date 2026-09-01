import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token


def test_password_hashing_and_verification():
    """Verify password hashing and verification logic."""
    raw_password = "SecurePassword123!"
    hashed = get_password_hash(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_encoding_and_decoding():
    """Verify JWT access token generation with custom role and center claims."""
    user_id = "11111111-1111-1111-1111-111111111111"
    center_id = "22222222-2222-2222-2222-222222222222"
    role = "center_admin"

    token = create_access_token(subject=user_id, role=role, center_id=center_id)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded["sub"] == user_id
    assert decoded["role"] == role
    assert decoded["center_id"] == center_id


def test_invalid_jwt_decoding():
    """Verify invalid token raises ValueError."""
    with pytest.raises(ValueError):
        decode_access_token("invalid.jwt.token")
