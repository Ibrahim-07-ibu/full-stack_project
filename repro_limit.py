from passlib.context import CryptContext
import sys

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_limit():
    long_password = "a" * 80
    print(f"Testing password of length {len(long_password)}")
    try:
        hashed = pwd_context.hash(long_password)
        print("Hashing successful.")
        verified = pwd_context.verify(long_password, hashed)
        print(f"Verification successful: {verified}")
    except Exception as e:
        print(f"Caught expected/unexpected error: {e}")

if __name__ == "__main__":
    test_limit()
