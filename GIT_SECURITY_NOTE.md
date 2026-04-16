# ⚠️ GITGUARDIAN ALERT - INFORMACIÓN IMPORTANTE

## Datos Sensibles Encontrados

Se detectaron datos sensibles en commits **antiguos** (marzo 2026):
- **Contraseña MySQL:** `1234wers` en commits: b7e1949, 25e491f, 2224c66, 12ce386, 1e41c84
- **JWT Secret:** `404E635...` en los mismos commits

## Estado Actual - LIMPIO ✅

Los archivos **ACTUALES** NO contienen estos datos:
- ✅ `application.properties` usa variables de entorno: `${DATASOURCE_PASSWORD:}`
- ✅ JWT secret usa variable: `${JWT_SECRET:YOUR_JWT_SECRET_HERE}`
- ✅ .gitignore previene futuros commits de .properties con secretos

## Solución

Estos commits antiguos tienen datos sensibles. Para limpiar el historial completo:

### Opción 1: Usar BFG Repo Cleaner (Recomendado)
```bash
# Instalar BFG
brew install bfg  # macOS
choco install bfg # Windows

# Crear archivo con credenciales a remover
echo "1234wers" > creds.txt
echo "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970" >> creds.txt

# Limpiar
bfg --replace-text creds.txt .git/objects

# Forzar push
git push --force-with-lease origin test-online
```

### Opción 2: Script en PowerShell
```powershell
# Script de limpieza para Windows
git filter-branch -f --tree-filter `
  "Get-ChildItem -Filter '*.properties' -Recurse | ForEach-Object { (Get-Content $_) -replace '1234wers','REDACTED' | Set-Content $_ }" `
  -- --all

git push --force-with-lease origin test-online
```

## Prioridad

- 🟡 **MEDIA:** Los commits antiguos tienen datos (de desarrollo local anterior)
- ✅ **CRÍTICO RESUELTO:** Los archivos actuales son seguros

Se recomienda limpiar el historial cuando sea posible, pero los datos actuales son seguros.

---
**Última revisión:** April 16, 2026

