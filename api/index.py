from fastapi import FastAPI

app = FastAPI(title="HomeBuddy Baseline")

@app.get("/api/infra-test")
def infra_test():
    import sys, os
    return {
        "status": "ok",
        "version": "21.0-ABSOLUTE-BASELINE",
        "sys_path": sys.path,
        "cwd": os.getcwd()
    }

@app.get("/api/health")
def health():
    return {"status": "healthy"}

handler = app
