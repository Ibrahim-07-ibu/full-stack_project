from fastapi import FastAPI

app = FastAPI()

@app.get("/api/infra-test")
def infra_test():
    return {"status": "ok", "message": "Raw FastAPI without Mangum is working"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
