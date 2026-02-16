#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para reiniciar PoliManage con Docker Compose
    
.DESCRIPTION
    Este script detiene todos los contenedores, limpia volúmenes si es necesario,
    y vuelve a levantar toda la infraestructura de PoliManage
    
.PARAMETER Clean
    Si se especifica, elimina los volúmenes de la base de datos para empezar desde cero
    
.EXAMPLE
    .\start.ps1
    Reinicia los servicios manteniendo los datos
    
.EXAMPLE
    .\start.ps1 -Clean
    Reinicia los servicios eliminando todos los datos (fresh start)
#>

param(
    [switch]$Clean
)

Write-Host "`n🔷 PoliManage - Inicio de Servicios" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: No se encuentra docker-compose.yml" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Paso 1: Detener todos los contenedores
Write-Host "📦 Paso 1: Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: Algunos contenedores pueden no haberse detenido correctamente" -ForegroundColor Yellow
}

# Paso 2: Limpiar volúmenes si se solicita
if ($Clean) {
    Write-Host "`n🧹 Paso 2: Limpiando volúmenes (FRESH START)..." -ForegroundColor Yellow
    Write-Host "   ⚠️  ADVERTENCIA: Se perderán todos los datos de la base de datos" -ForegroundColor Red
    
    $confirmation = Read-Host "   ¿Estás seguro? (escribe 'si' para confirmar)"
    if ($confirmation -eq 'si') {
        docker-compose down -v
        Write-Host "   ✅ Volúmenes eliminados" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Limpieza cancelada, se mantendrán los datos existentes" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n📊 Paso 2: Manteniendo datos existentes..." -ForegroundColor Yellow
    Write-Host "   ℹ️  Usa -Clean para empezar desde cero" -ForegroundColor Cyan
}

# Paso 3: Construir imágenes
Write-Host "`n🔨 Paso 3: Construyendo imágenes Docker..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir las imágenes" -ForegroundColor Red
    exit 1
}

# Paso 4: Levantar servicios
Write-Host "`n🚀 Paso 4: Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar los servicios" -ForegroundColor Red
    exit 1
}

# Paso 5: Esperar a que los servicios estén listos
Write-Host "`n⏳ Paso 5: Esperando a que los servicios estén listos..." -ForegroundColor Yellow

Write-Host "   Verificando PostgreSQL..." -ForegroundColor Gray
$timeout = 60
$elapsed = 0
while ($elapsed -lt $timeout) {
    $pgStatus = docker-compose ps postgres --format json | ConvertFrom-Json
    if ($pgStatus.Health -eq "healthy") {
        Write-Host "   ✅ PostgreSQL listo" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "   ⏳ Esperando... ($elapsed/$timeout segundos)" -ForegroundColor Gray
}

if ($elapsed -ge $timeout) {
    Write-Host "   ⚠️  Timeout esperando PostgreSQL" -ForegroundColor Yellow
}

# Paso 6: Verificar estado de los servicios
Write-Host "`n📊 Paso 6: Estado de los servicios:" -ForegroundColor Yellow
docker-compose ps

# Paso 7: Mostrar información de acceso
Write-Host "`n✅ PoliManage iniciado correctamente!`n" -ForegroundColor Green
Write-Host "🌐 URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:          http://localhost:5173" -ForegroundColor White
Write-Host "   Backend Go:        http://localhost:8080" -ForegroundColor White
Write-Host "   Backend Python:    http://localhost:8000" -ForegroundColor White
Write-Host "   PostgreSQL:        localhost:5432" -ForegroundColor White
Write-Host "   pgAdmin:           http://localhost:5050" -ForegroundColor White
Write-Host "                      📧 admin@polimanage.com / 🔑 admin123`n" -ForegroundColor Gray

Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:          docker-compose logs -f [servicio]" -ForegroundColor White
Write-Host "   Detener todo:      docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar:         .\start.ps1" -ForegroundColor White
Write-Host "   Fresh start:       .\start.ps1 -Clean`n" -ForegroundColor White

Write-Host "🔍 Para ver los logs en tiempo real, ejecuta:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f`n" -ForegroundColor White
