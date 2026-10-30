# Guía Docker — despliegue en la VM

Referencia operativa para subir, actualizar y diagnosticar las apps en el VPS.
Aplica a **Loyalty** (`8090`) y **Notas** (`8091`), y sirve de base para una app nueva.

---

## 1. La VM

| Dato | Valor |
|---|---|
| Host | `40.160.241.75` (`vps-c0853c1c.vps.ovh.us`) |
| SO | Debian 11 |
| Usuario SSH | `debian` (tiene `sudo` y puede usar Docker) |
| Docker | 20.10.5 · Compose v2.24 |
| Tunnel | Cloudflare Tunnel token-based (`cloudflared`, host network) |
| Tunnel ID | `9b12e650-f0e0-4415-a05d-7a84ddc15565` |

### Puertos

| Puerto | Qué corre |
|---|---|
| 80/443 | VM QEMU (MuWarlords legado). **No tocar** |
| 8080 | Portfolio 2026 |
| 8089 | Cine Marcener |
| **8090** | **Loyalty** |
| **8091** | **Notas** |
| 22 | SSH |
| 3306 | **cerrado** (MySQL solo en redes Docker) |

Cada stack tiene su proyecto Compose, red y volumen. **Nunca** comparten base de datos.

---

## 2. Acceso SSH (y cuándo pide la password)

### Con clave (recomendado, no pide nada)

La clave vive en tu máquina:

```
C:\Users\user\.ssh\id_ed25519      (privada — no compartir)
C:\Users\user\.ssh\id_ed25519.pub  (pública — se autoriza en el VPS)
```

Probar:

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" debian@40.160.241.75 "hostname"
```

Si responde `vps-c0853c1c`, listo: **no pide password**.

### Si no tenés la clave o es una máquina nueva

Generala y autorizala (la password se escribe **una vez**, en el prompt, y no se guarda):

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519" -N '""' -C "loyalty-deploy"
```

```powershell
# pide: debian@40.160.241.75's password:  <- la escribís vos
type "$env:USERPROFILE\.ssh\id_ed25519.pub" | ssh debian@40.160.241.75 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

En Linux/WSL/macOS: `ssh-copy-id -i ~/.ssh/id_ed25519.pub debian@40.160.241.75`.

### Dónde se escribe la password

- `ssh debian@40.160.241.75` → aparece `debian@40.160.241.75's password:` y escribís ahí.
  El cursor no se mueve y no se ve nada: es normal.
- `scp ... debian@host:...` → pide lo mismo.
- `sudo ...` → si el usuario no tiene NOPASSWD, pide la password de `debian`.
- Si tu terminal no es interactiva (script/CI), usá la clave. **Nunca** pongas la password
  en `.env`, en un script ni en el repo.

### Si necesitás una ventana interactiva en Windows

```powershell
Start-Process powershell -ArgumentList "-NoExit","-Command","ssh debian@40.160.241.75"
```

Escribís la password en esa ventana y seguís ahí.

---

## 3. Estructura en el VPS

| App | Ruta | Rama | Compose | Puerto |
|---|---|---|---|---|
| Loyalty | `/opt/loyalty-app` | `master` | `docker-compose.yml` | 8090 |
| Notas | `/opt/notas-app` | `master` | `docker-compose.prod.yml` | 8091 |

Cada una tiene su `.env` (permisos `600`, ignorado por git). **No se versiona.**

Volúmenes:

- `loyalty-app_mysql_data`
- `notas-app_notas_mysql_data`
- `notas-app_notas_storage` (adjuntos, storage local)

---

## 4. Subir Loyalty (primera vez)

```bash
ssh -i ~/.ssh/id_ed25519 debian@40.160.241.75
sudo mkdir -p /opt/loyalty-app && sudo chown debian:debian /opt/loyalty-app
git clone https://github.com/gastongalumar/loyalty-app.git /opt/loyalty-app
cd /opt/loyalty-app
cp .env.prod.example .env
nano .env          # MYSQL_*, APP_JWT_SECRET, bootstrap
chmod 600 .env
docker compose up -d --build
docker compose ps
```

Verificar:

```bash
curl -fsS http://127.0.0.1:8090/healthz
curl -fsS http://127.0.0.1:8090/manifest.webmanifest | head -c 120
docker compose logs -f backend
```

Actualizar:

```bash
cd /opt/loyalty-app && ./scripts/update.sh
```

---

## 5. Subir Notas (primera vez)

```bash
sudo mkdir -p /opt/notas-app && sudo chown debian:debian /opt/notas-app
git clone -b master https://github.com/gastongalumar/NOTES-APP.git /opt/notas-app
cd /opt/notas-app
cp .env.prod.example .env
nano .env          # DB_*, JWT_SECRET y bootstrap (MinIO ya no se usa)
chmod 600 .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Verificar:

```bash
curl -fsS http://127.0.0.1:8091/ | head -c 80
docker compose -f docker-compose.prod.yml logs -f backend
```

Notas usa **storage local** (volumen `notas-app_notas_storage`), no MinIO: las imágenes
`minio/minio` ya no se distribuyen libremente. MailHog queda interno para no romper el
flujo de mails.

> `REQUIRE_EMAIL_VERIFICATION=false` en el compose de producción porque MailHog no entrega
> mails reales. Si configurás Resend (`MAIL_PROVIDER=resend`, `RESEND_API_KEY`), ponelo en
> `true`.

Actualizar:

```bash
cd /opt/notas-app
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 6. Cloudflare Tunnel (dominio)

El `cloudflared` corre con **token** y `network_mode: host`; las rutas se administran en
**Zero Trust → Networks → Tunnels → `vps-c0853c1c` → Public Hostnames**.

| Hostname | Service |
|---|---|
| `loyalty.programandos.site` | `http://localhost:8090` |
| `notas.programandos.site` | `http://localhost:8091` |

**Importante:** el service va con **`http://`**, no `https://`. El nginx del contenedor
sirve HTTP; con `https://` Cloudflare devuelve 502 y en los logs aparece
`tls: first record does not look like a TLS handshake`.

Verificar:

```bash
curl -skI https://loyalty.programandos.site | head -3
curl -skI https://notas.programandos.site | head -3
docker logs cloudflared --tail 30 | grep -iE 'error|Updated'
```

No hace falta abrir 8090/8091 en el firewall: el túnel sale por outbound.

---

## 7. Operación diaria

```bash
# estado
cd /opt/loyalty-app && docker compose ps
cd /opt/notas-app   && docker compose -f docker-compose.prod.yml ps

# logs
docker logs loyalty-backend --tail 100 -f
docker logs notas-backend   --tail 100 -f

# reiniciar un servicio
docker compose restart backend

# backup Loyalty
cd /opt/loyalty-app && ./scripts/backup.sh

# backup Notas
cd /opt/notas-app
docker compose -f docker-compose.prod.yml exec -T mysql sh -c \
  'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --routines --no-tablespaces "$MYSQL_DATABASE"' \
  > /tmp/notas_$(date +%Y%m%d_%H%M%S).sql

# espacio en disco
df -h /
docker system df
docker builder prune -f     # solo build cache; seguro
```

---

## 8. Troubleshooting

| Síntoma | Causa | Solución |
|---|---|---|
| `502` / `Host Error` en el dominio | Public hostname con `https://` | Cambiar a `http://localhost:PUERTO` |
| `tls: first record does not look like a TLS handshake` | Igual que arriba | Igual |
| `pull access denied for minio/minio` | MinIO dejó de publicarse | Usar `STORAGE_PROVIDER=local` |
| Login `403 EmailNotVerified` | Usuario sin verificar | Configurar mail real o `REQUIRE_EMAIL_VERIFICATION=false` |
| `port is already allocated` | Puerto ocupado | `ss -tln \| grep :809X` y cambiar `HTTP_PORT` |
| El dominio muestra otra web | El túnel no tiene el hostname | Agregar Public Hostname en Zero Trust |
| Disco lleno | build cache | `docker builder prune -f` |
| `git pull` falla por cambios locales | `.env` no molesta; otro archivo sí | `git status`, resolver, `git pull --ff-only` |
| La app no ve cambios | imagen vieja | `docker compose up -d --build` |
| `Permission denied (publickey)` | clave no autorizada | Repetir `ssh-copy-id` / `authorized_keys` |

---

## 9. Seguridad

- `.env` en el servidor con `chmod 600`; **nunca** en git.
- No exponer 8080/8090/8091/3306 a Internet; el acceso público va por el túnel.
- Cambiar `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `APP_JWT_SECRET` y el admin inicial
  respecto de los ejemplos (`CAMBIAR_...`).
- El bootstrap es idempotente: cambiar la password en `.env` **no** actualiza un usuario
  existente.
- Rotar la clave SSH si se compartió; `ssh-keygen -p` para ponerle passphrase.
- `docker compose config` valida el `.env` antes de levantar (falla si falta un `${VAR:?}`).

---

## 10. Checklist para una app nueva

1. `name:` propio en el compose y red dedicada.
2. Solo el frontend publica puerto (`${HTTP_PORT}:80`); DB/backend internos.
3. `.env.prod.example` con placeholders + `.env` real en el servidor (`600`).
4. Healthchecks en db/backend/frontend.
5. Volumen propio para DB y para archivos.
6. Public Hostname en Cloudflare con `http://localhost:PUERTO`.
7. Verificar `healthz`, login y un endpoint público antes de avisar.
8. Documentar puerto, volumen y hostname en este archivo.
