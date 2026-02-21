from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
def hello():
    return {"message": "Hello from api/hello.py", "status": "experimental"}

handler = app
