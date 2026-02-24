from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_BCRYPT_BYTES = 72

def hash_password(password: str) -> str:
    # Ensure password fits bcrypt limit
    safe_password = password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", errors="ignore")
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = plain_password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", errors="ignore")
    return pwd_context.verify(safe_password, hashed_password)