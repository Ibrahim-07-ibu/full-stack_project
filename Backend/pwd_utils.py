from passlib.context import CryptContext

# Use pbkdf2_sha256 as primary to avoid bcrypt binary/limit issues on Vercel
# bcrypt is kept in the list to support verification of existing hashes if any
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)