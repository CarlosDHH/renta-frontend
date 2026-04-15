# API Reference — Renta Internet Backend

Base URL: `http://localhost:3000/api`

---

## Formato de respuesta

Todos los endpoints devuelven el mismo envelope:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "...",
  "data": { } | null,
  "errors": "..."
}
```

Para endpoints paginados, `data` tiene esta forma:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

Paginación por query params: `?page=1&limit=20` (defaults: page=1, limit=20)

---

## Autenticación

Enviar el access token en el header de cada petición protegida:

```
Authorization: Bearer <accessToken>
```

El access token expira en **15 minutos**. Usar `/api/auth/refresh` para renovarlo.

---

## AUTH `/api/auth`

### POST `/api/auth/login`
No requiere token.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "secreto123"
}
```

**Response 200:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Carlos",
      "lastName": "García",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

| Status | Motivo |
|--------|--------|
| 401 | Credenciales inválidas |
| 403 | Cuenta bloqueada (5 intentos fallidos → bloqueo 15 min) |

---

### POST `/api/auth/refresh`
No requiere token.

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

| Status | Motivo |
|--------|--------|
| 401 | Refresh token inválido o expirado |

---

## USERS `/api/users`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | ADMIN |
| GET | `/:id` | ADMIN |
| POST | `/` | ADMIN |
| PATCH | `/:id` | ADMIN |
| DELETE | `/:id` | ADMIN |

### GET `/api/users`
Query params: `search` (busca en name, lastName, email)

**Response 200** — lista paginada. Cada item:
```json
{
  "id": "uuid",
  "name": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string | null",
  "role": "ADMIN | OPERATOR",
  "active": true,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```
> La contraseña nunca se devuelve en ningún endpoint.

---

### GET `/api/users/:id`
**Response 200** — mismo objeto de arriba.

| Status | Motivo |
|--------|--------|
| 404 | Usuario no encontrado |

---

### POST `/api/users`

**Body:**
```json
{
  "name": "string",            // requerido
  "lastName": "string",        // requerido
  "email": "string",           // requerido, único
  "password": "string",        // requerido
  "phone": "string",           // opcional
  "role": "ADMIN | OPERATOR"   // opcional, default: OPERATOR
}
```

**Response 201** — objeto usuario (sin contraseña)

| Status | Motivo |
|--------|--------|
| 409 | Ya existe un usuario con ese email |

---

### PATCH `/api/users/:id`
Todos los campos son opcionales:
```json
{
  "name": "string",
  "lastName": "string",
  "phone": "string",
  "role": "ADMIN | OPERATOR",
  "active": true
}
```
> Email y contraseña **no son actualizables** por este endpoint.

**Response 200** — usuario actualizado

---

### DELETE `/api/users/:id`
Sin body. Soft delete (`deleted: true, active: false`).

---

## CUSTOMERS `/api/customers`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | cualquier rol autenticado |
| GET | `/:id` | cualquier rol autenticado |
| POST | `/` | ADMIN, OPERATOR |
| PATCH | `/:id` | ADMIN, OPERATOR |
| DELETE | `/:id` | ADMIN |

### GET `/api/customers`
Query params: `search` (busca en name, lastName, phone, municipality), `active` (true|false)

**Response 200** — lista paginada. Cada item incluye el contrato activo con su plan:
```json
{
  "id": "uuid",
  "name": "string",
  "lastName": "string",
  "email": "string | null",
  "phone": "string",
  "municipality": "string | null",
  "city": "string | null",
  "lastPaidPeriod": "2026-01-31T00:00:00.000Z | null",
  "active": true,
  "contracts": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "plan": { "id": "uuid", "name": "string", "mbps": 10, "price": 250 }
    }
  ]
}
```

---

### GET `/api/customers/:id`
**Response 200** — cliente completo con todos sus contratos. Cada contrato incluye los últimos 5 pagos.

| Status | Motivo |
|--------|--------|
| 404 | Cliente no encontrado |

---

### POST `/api/customers`

**Body:**
```json
{
  "name": "string",          // requerido
  "lastName": "string",      // requerido
  "phone": "string",         // requerido
  "email": "string",         // opcional
  "municipality": "string",  // opcional
  "city": "string"           // opcional
}
```

**Response 201** — objeto cliente

| Status | Motivo |
|--------|--------|
| 409 | Ya existe un cliente con ese correo |

---

### PATCH `/api/customers/:id`
Todos los campos son opcionales:
```json
{
  "name": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "municipality": "string",
  "city": "string",
  "active": true
}
```

---

### DELETE `/api/customers/:id`
Sin body. Soft delete.

---

## PLANS `/api/plans`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | público |
| GET | `/:id` | público |
| POST | `/` | ADMIN |
| PATCH | `/:id` | ADMIN |
| DELETE | `/:id` | ADMIN |

### GET `/api/plans`
Query params: `search` (busca en name, description), `active` (true|false)

**Response 200** — lista paginada:
```json
{
  "id": "uuid",
  "name": "string",
  "mbps": 10,
  "price": 250.00,
  "description": "string | null",
  "active": true
}
```

---

### GET `/api/plans/:id`
**Response 200** — plan + contratos activos vinculados (id + nombre del cliente).

| Status | Motivo |
|--------|--------|
| 404 | Plan no encontrado |

---

### POST `/api/plans`

**Body:**
```json
{
  "name": "string",         // requerido, único
  "mbps": 10,               // requerido, número entero
  "price": 250.00,          // requerido, decimal
  "description": "string"   // opcional
}
```

**Response 201** — objeto plan

| Status | Motivo |
|--------|--------|
| 409 | Ya existe un plan con ese nombre |

---

### PATCH `/api/plans/:id`
Todos los campos son opcionales:
```json
{
  "name": "string",
  "mbps": 10,
  "price": 250.00,
  "description": "string",
  "active": true
}
```

---

### DELETE `/api/plans/:id`
Sin body. Soft delete.

| Status | Motivo |
|--------|--------|
| 409 | El plan tiene contratos activos, no se puede eliminar |

---

## CONTRACTS `/api/contracts`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | cualquier rol autenticado |
| GET | `/:id` | cualquier rol autenticado |
| POST | `/` | ADMIN, OPERATOR |
| PATCH | `/:id/status` | ADMIN |
| DELETE | `/:id` | ADMIN |

### GET `/api/contracts`
Query params: `status` (ACTIVE|SUSPENDED|CANCELLED), `customerId`

**Response 200** — lista paginada. Cada item incluye:
- `customer`: id, name, lastName, phone
- `plan`: id, name, mbps, price

---

### GET `/api/contracts/:id`
**Response 200** — contrato completo con customer, plan, y todos los pagos (orden: más reciente primero).

| Status | Motivo |
|--------|--------|
| 404 | Contrato no encontrado |

---

### POST `/api/contracts`

**Body:**
```json
{
  "customerId": "uuid",      // requerido
  "planId": "uuid",          // requerido
  "startDate": "2026-01-01"  // opcional, default: hoy
}
```

**Response 201** — contrato con customer y plan

| Status | Motivo |
|--------|--------|
| 404 | Cliente no encontrado |
| 404 | Plan no encontrado o inactivo |
| 409 | El cliente ya tiene un contrato activo |

---

### PATCH `/api/contracts/:id/status`

**Body:**
```json
{
  "status": "ACTIVE | SUSPENDED | CANCELLED"  // requerido
}
```

> Al cambiar a `SUSPENDED` o `CANCELLED`, se registra automáticamente `endDate`.

**Response 200** — contrato actualizado con customer y plan

| Status | Motivo |
|--------|--------|
| 400 | El contrato ya está en ese estado |
| 404 | Contrato no encontrado |

---

### DELETE `/api/contracts/:id`
Sin body. Soft delete.

| Status | Motivo |
|--------|--------|
| 409 | No se puede eliminar un contrato ACTIVE |

---

## PAYMENTS `/api/payments`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | cualquier rol autenticado |
| GET | `/:id` | cualquier rol autenticado |
| POST | `/` | ADMIN, OPERATOR |
| DELETE | `/:id` | ADMIN |

### GET `/api/payments`
Query params: `contractId`, `customerId`, `paymentType` (FULL|PARTIAL_ADVANCE|PARTIAL_LATE)

**Response 200** — lista paginada. Cada item incluye:
- `contract` → `customer` (id, name, lastName) + `plan` (id, name, price)
- `user`: id, name, lastName (operador que registró el pago)
- `receipt`: id, folio, sendStatus

---

### GET `/api/payments/:id`
**Response 200** — pago completo con contrato, cliente, plan, usuario y comprobante.

| Status | Motivo |
|--------|--------|
| 404 | Pago no encontrado |

---

### POST `/api/payments`

**Body:**
```json
{
  "contractId": "uuid",                              // requerido
  "amount": 250.00,                                  // requerido
  "periodFrom": "2026-01-01",                        // requerido, fecha ISO
  "periodTo": "2026-01-31",                          // requerido, fecha ISO
  "paymentType": "FULL | PARTIAL_ADVANCE | PARTIAL_LATE", // opcional, default: FULL
  "paymentMethod": "CASH | TRANSFER | CARD",         // opcional, default: CASH
  "balance": 50.00,                                  // opcional, saldo pendiente
  "notes": "string"                                  // opcional
}
```

> Al crear un pago se genera automáticamente un **Receipt** con folio `RNT-{año}-{XXXXXX}`.
> Si `paymentType` es `FULL` (o no se envía), se actualiza `customer.lastPaidPeriod` al valor de `periodTo`.

**Response 201** — pago con el receipt incluido:
```json
{
  "data": {
    "id": "uuid",
    "contractId": "uuid",
    "amount": 250.00,
    "paymentType": "FULL",
    "paymentMethod": "CASH",
    "balance": null,
    "periodFrom": "2026-01-01T00:00:00.000Z",
    "periodTo": "2026-01-31T00:00:00.000Z",
    "paidAt": "2026-04-08T00:00:00.000Z",
    "notes": null,
    "contract": { ... },
    "user": { "id": "uuid", "name": "...", "lastName": "..." },
    "receipt": {
      "id": "uuid",
      "folio": "RNT-2026-000001",
      "sendStatus": "PENDING",
      "recipientPhone": "..."
    }
  }
}
```

| Status | Motivo |
|--------|--------|
| 404 | Contrato no encontrado o no está ACTIVE |

---

### DELETE `/api/payments/:id`
Sin body. Soft delete.

---

## RECEIPTS `/api/receipts`

Requiere: `Authorization: Bearer <token>`

| Método | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/` | público |
| GET | `/:id` | público |
| GET | `/:id/pdf` | público |
| GET | `/folio/:folio` | público |
| GET | `/validate/:folio` | público |
| PATCH | `/:id/mark-sent` | ADMIN, OPERATOR |

### GET `/api/receipts`
Query params: `sendStatus` (PENDING|SENT|FAILED)

**Response 200** — lista paginada con payment → contract → customer + plan + user.

---

### GET `/api/receipts/:id`
**Response 200** — comprobante completo con payment, contrato, cliente, plan y usuario.

---

### GET `/api/receipts/:id/pdf`
Devuelve el **archivo PDF directamente** (no JSON).

```
Content-Type: application/pdf
Content-Disposition: inline; filename="comprobante-RNT-2026-000001.pdf"
```

> Para mostrarlo en el frontend usar directamente la URL en un `<iframe>` o tag `<a>`.

---

### GET `/api/receipts/folio/:folio`
Busca por folio (ej: `RNT-2026-000001`). Misma respuesta que `GET /:id`.

| Status | Motivo |
|--------|--------|
| 404 | Folio no encontrado |

---

### GET `/api/receipts/validate/:folio`
Validación ligera de folio. Útil para verificar autenticidad sin traer todo el objeto.

**Response 200:**
```json
{
  "data": {
    "valid": true,
    "receipt": {
      "folio": "RNT-2026-000001",
      "createdAt": "...",
      "sendStatus": "PENDING",
      "payment": {
        "amount": 250,
        "periodFrom": "...",
        "periodTo": "...",
        "paymentType": "FULL",
        "contract": {
          "customer": { "name": "Carlos", "lastName": "García" },
          "plan": { "name": "Plan 10MB" }
        }
      }
    }
  }
}
```

| Status | Motivo |
|--------|--------|
| 404 | Folio inválido |

---

### PATCH `/api/receipts/:id/mark-sent`

**Body:**
```json
{
  "recipientPhone": "string"  // opcional, actualiza el teléfono destinatario si se envía
}
```

Establece `sendStatus: "SENT"` y registra `sentAt`.

| Status | Motivo |
|--------|--------|
| 400 | El comprobante ya fue marcado como enviado |
| 404 | Comprobante no encontrado |

---

## EMAIL `/api/email`

> No requiere autenticación (middleware comentado).

### POST `/api/email/receipt`
Envía el comprobante de pago por correo con el PDF adjunto.

**Body:**
```json
{
  "customerEmail": "cliente@example.com",
  "receiptData": {
    "folio": "RNT-2026-000001"
  }
}
```

---

### POST `/api/email/reminder`
Envía un recordatorio de pago por correo.

**Body:**
```json
{
  "customerEmail": "cliente@example.com",
  "reminderData": {
    "customerName": "Carlos",
    "planName": "Plan 10MB",
    "amount": 250.00,
    "dueDate": "2026-01-31",
    "daysLeft": 3
  }
}
```

---

### POST `/api/email/reminders/send-pending`
Envío masivo a todos los contratos activos con fecha de vencimiento dentro de 5 días. Sin body.

**Response 200:**
```json
{
  "message": "Recordatorios procesados: 5 enviados, 1 fallidos"
}
```

---

## Referencia de enums

| Enum | Valores |
|------|---------|
| Role | `ADMIN`, `OPERATOR` |
| ContractStatus | `ACTIVE`, `SUSPENDED`, `CANCELLED` |
| PaymentType | `FULL`, `PARTIAL_ADVANCE`, `PARTIAL_LATE` |
| PaymentMethod | `CASH`, `TRANSFER`, `CARD` |
| SendStatus | `PENDING`, `SENT`, `FAILED` |
