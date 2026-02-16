from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from presentation.controllers import pista_controller, club_controller

app = FastAPI(
    title="PoliManage API",
    description="Backend API para PoliManage",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(pista_controller.router, prefix="/api")
app.include_router(club_controller.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "PoliManage API está corriendo correctamente",
        "status": "ok",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "backend-python"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
