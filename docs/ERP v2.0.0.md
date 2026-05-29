# Documento de Especificación de Requisitos (ERP)

**Proyecto:** S3-Lite
**Versión:** 2.0.0
**Fecha:** 2025-07-11
**Estado:** Revisado — Alineado con pautas de diseño HLD
**Enfoque Principal:** Infraestructura como Código y Validación CI/CD

---

## Registro de Cambios

| Versión | Fecha | Descripción |
| :--- | :--- | :--- |
| **2.0.0** | 2025-07-11 | Revisión completa: incorporación de Auth Service (IAM) y entidad `User`; `Bucket` como entidad explícita con creación previa obligatoria; versionado de objetos (RF-06); endpoint de eliminación (RF-04); listado por prefijo (RF-05); metadata de usuario como pares clave-valor (RF-07, tabla `object_metadata`); `key` de objeto como string tipo path; nuevos RNF de atomicidad, unicidad y tests de seguridad. Alineado con pautas de diseño HLD. |
| 1.0.0 | — | Versión inicial. Solo upload/download. Sin versionado, sin creación explícita de bucket, sin auth, sin eliminación, sin listado. |

---

## 1. Propósito y Alcance

El objetivo de este proyecto es desarrollar un servicio web para el almacenamiento y recuperación de objetos (archivos y metadatos) que simule las capacidades operativas básicas de Amazon S3.

La filosofía principal es mantener el alcance de la aplicación **estrictamente acotado** para enfocar los esfuerzos en la automatización, pruebas y robustez del pipeline de CI/CD. No se debe agregar complejidad accidental ni funcionalidades no solicitadas explícitamente.

### 1.1 Dentro del Alcance

- Creación explícita de buckets como contenedores lógicos únicos.
- Carga y descarga de objetos binarios mediante streaming.
- Eliminación de objetos (por versión o versión más reciente).
- Versionado de objetos: la misma key genera una nueva versión, nunca sobrescritura.
- Listado de objetos en un bucket filtrado por prefijo de key.
- Metadata de objeto como pares clave-valor definidos por el usuario.
- Autenticación y autorización básica (IAM simplificado).
- Documentación de API vía OpenAPI 3.0.x (Swagger UI + Scalar UI).
- Contenerización con Docker multi-stage.
- Pipeline de CI/CD con validación de cobertura de pruebas.

### 1.2 Fuera de Alcance

- Compatibilidad con clientes nativos de AWS (AWS CLI, firmas SigV4).
- Interfaz gráfica de usuario (GUI) propia.
- Procesamiento distribuido, replicación de nodos o clustering.
- Paginación avanzada con cursores (solo filtrado por prefijo).
- Gestión de roles y políticas complejas (IAM avanzado).

---

## 2. Stack Tecnológico Mandatorio

| Componente | Tecnología Requerida |
| :--- | :--- |
| **Lenguaje** | Java 26 |
| **Framework** | Spring Boot 4.0.6 |
| **Herramienta de Build** | Maven 3.9.x |
| **Persistencia (Metadatos)** | Spring Data JPA + H2 (entorno test) / PostgreSQL (entorno prod) |
| **Almacenamiento Físico** | `java.nio.file` sobre sistema de archivos local montado en volumen |
| **Documentación API** | OpenAPI 3.0.x (Swagger UI + Scalar UI) |
| **Contenerización** | Docker (Multi-stage build) |
| **Seguridad** | Spring Security 6.x (HTTP Basic / JWT — configurable) |

---

## 3. Arquitectura del Sistema

### 3.1 Visión General

El sistema se diseña como una **aplicación monolítica ligera y autocontenida** organizada en cuatro servicios lógicos con responsabilidades claras, aplicando el principio de **Inversión de Dependencias** para mantener un desacoplamiento estricto entre capas.

El **API Service** actúa como punto de entrada central que orquesta internamente al resto de servicios:

| Servicio | Responsabilidad |
| :--- | :--- |
| **API Service** | Punto de entrada REST. Recibe peticiones HTTP, orquesta los demás servicios y devuelve respuestas al cliente. Generado a partir del contrato OpenAPI (API-First). |
| **Auth Service (IAM)** | Autentica la identidad del cliente (¿quién es?) y autoriza la operación (¿puede hacerlo?). Consultado por el API Service antes de cualquier operación sobre recursos. |
| **Metadata Service** | Lee y escribe metadatos de buckets y objetos en la base de datos relacional. Gestiona también los pares clave-valor de metadata definidos por el usuario. |
| **Data Service** | Lee y escribe el payload binario de los objetos en el sistema de archivos local a través de `StorageProvider` / `FileSystemStorageProvider` usando `java.nio.file`. |

```
┌──────────────────────────────────────────────────────────┐
│                  Cliente (HTTP)                           │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                     API Service                           │
│        Punto de entrada REST — Orquestación               │
└──────┬────────────────┬──────────────────┬───────────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼───────────────┐
│ Auth Service│  │  Metadata   │  │     Data Service       │
│    (IAM)    │  │   Service   │  │  (FileSystemStorage    │
│             │  │  (JPA / DB) │  │   Provider)            │
└─────────────┘  └─────────────┘  └────────────────────────┘
```

### 3.2 Modelo de Entidades de Dominio

El sistema gestiona tres entidades principales de dominio:

| Entidad | Descripción |
| :--- | :--- |
| **User** | Representa un cliente autenticado del sistema. Un `User` puede ser propietario de uno o más `Bucket`s. |
| **Bucket** | Contenedor lógico de objetos. Nombre globalmente único entre todos los usuarios. Debe crearse explícitamente antes de usarse. |
| **Object** | Unidad de almacenamiento identificada por su `key` dentro de un bucket. Soporta múltiples versiones. Tiene dos partes: **payload** (binario en disco) y **metadata** (pares clave-valor en DB). |

### 3.3 Flujos Principales

#### 3.3.1 Creación de Bucket

1. El cliente envía `HTTP PUT /api/buckets/{bucketName}`.
2. El **API Service** llama al **Auth Service** para autenticar al cliente y verificar que tiene permiso para crear buckets.
3. Un bucket es únicamente metadata. Tras la autenticación exitosa, el **API Service** llama al **Metadata Service** para insertar una nueva fila en la tabla `buckets` de la base de datos.
4. El **API Service** retorna `201 Created` al cliente.

#### 3.3.2 Carga de Objeto (Upload)

1. Con el bucket creado, el cliente envía `HTTP PUT /api/storage/{bucketName}/{objectKey}`.
2. El **API Service** llama al **Auth Service** para autenticar al cliente y verificar que tiene permiso de escritura (`write`) sobre el bucket.
3. Tras la autenticación, el **API Service** reenvía el payload del cliente al **Data Service**, que persiste el payload como un nuevo objeto y retorna su `id` al **API Service**.
4. El **API Service** llama al **Metadata Service** para insertar una nueva fila en la tabla `objects`. Si ya existe un objeto con la misma `key`, se crea una nueva versión con `versionId` incremental; **no se sobrescribe el objeto anterior**.
5. El **API Service** retorna `201 Created` al cliente junto al header `X-Version-Id`.

#### 3.3.3 Descarga de Objeto (Download)

1. Con el bucket y objeto existentes, el cliente envía `HTTP GET /api/storage/{bucketName}/{objectKey}` (opcionalmente con `?versionId=N`).
2. El **API Service** llama al **Auth Service** para autenticar al cliente y verificar que tiene permiso de lectura (`read`) sobre el bucket.
3. Dado que el cliente envía la `key` del objeto (no su `id` interno), el **API Service** debe primero resolver la `key` a su `id`. Por ello llama al **Metadata Service** para consultar la tabla `objects` y obtener el `id` del objeto. **Nota:** en el flujo de descarga se visita el Metadata Service _antes_ que el Data Service, a diferencia del flujo de carga.
4. Con el `id` del objeto resuelto, el **API Service** lo envía al **Data Service**, que responde con el stream binario del payload.
5. El **API Service** retorna `200 OK` al cliente con el payload como stream, junto al `Content-Type` y `Content-Length` correctos.

---

## 4. Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Criterio de Aceptación (CI/CD) | Servicios | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | **Creación de Bucket** | El sistema debe permitir crear un bucket mediante `PUT /api/buckets/{bucketName}`. El nombre del bucket debe ser único globalmente. El bucket debe existir antes de poder subir objetos. | Si el bucket ya existe: `409 Conflict`. Nombre inválido: `400 Bad Request`. Creación exitosa: `201 Created`. La fila debe persistirse en la tabla `buckets` con todos sus campos. | API, Auth, Metadata | 🆕 NUEVO |
| **RF-02** | **Carga de Objeto** | El sistema debe permitir subir un objeto a un bucket existente mediante `PUT /api/storage/{bucketName}/{objectKey}`. El cuerpo es el flujo binario bruto. Si ya existe un objeto con la misma key, se crea una nueva versión. | Si el bucket no existe: `404 Not Found`. Carga exitosa: `201 Created` + header `X-Version-Id`. El payload debe escribirse en disco. Los metadatos deben persistirse con el `versionId` correcto. No deben sobrescribirse versiones anteriores. | API, Auth, Data, Metadata | ✏️ MODIFICADO |
| **RF-03** | **Descarga de Objeto** | El sistema debe devolver el contenido exacto de un objeto mediante streaming a través de `GET /api/storage/{bucketName}/{objectKey}`. Acepta `?versionId=N` para recuperar una versión específica. | Si el objeto no existe: `404 Not Found`. Si existe: `200 OK` con `Content-Type`, `Content-Length` correctos y payload como stream. Sin `versionId`, retorna la versión más reciente. | API, Auth, Metadata, Data | ✏️ MODIFICADO |
| **RF-04** | **Eliminación de Objeto** | El sistema debe permitir eliminar un objeto o una versión específica mediante `DELETE /api/storage/{bucketName}/{objectKey}?versionId=N`. Sin `versionId` aplica soft delete a la versión más reciente. | Si el objeto no existe: `404 Not Found`. Eliminación exitosa: `204 No Content`. El payload en disco y los metadatos correspondientes deben eliminarse o marcarse como eliminados. | API, Auth, Metadata, Data | 🆕 NUEVO |
| **RF-05** | **Listado por Prefijo** | El sistema debe permitir listar objetos de un bucket mediante `GET /api/buckets/{bucketName}/objects?prefix={prefix}`. Sin prefijo, lista todos los objetos (última versión de cada key). | Retorna `200 OK` con array JSON de objetos que incluye: `key`, `versionId`, `sizeInBytes`, `mimeType`, `createdAt`. Retorna solo la versión más reciente de cada key salvo que se indique `?allVersions=true`. | API, Auth, Metadata | 🆕 NUEVO |
| **RF-06** | **Versionado de Objetos** | Subir un objeto con una key que ya existe en el mismo bucket **no debe sobrescribir** el objeto anterior. Debe crear una nueva versión con `versionId` auto-incremental. Ambas versiones deben ser accesibles y descargables de forma independiente. | `GET /{bucket}/{key}` sin `versionId` retorna la versión más reciente. `GET` con `?versionId=1` retorna la primera versión. La tabla `objects` debe contener ambas filas con el mismo `bucketId` y `key` pero distinto `versionId`. | API, Metadata, Data | 🆕 NUEVO |
| **RF-07** | **Metadata de Usuario** | Por cada objeto subido, el cliente puede incluir metadata personalizada como pares clave-valor arbitrarios en los headers de la petición (prefijo `x-amz-meta-`). Esta metadata se almacena en una tabla separada del payload y de los metadatos del sistema. | La consulta a la tabla `object_metadata` debe reflejar exactamente los pares enviados. La descarga de un objeto debe incluir los headers de metadata en la respuesta. Los campos del sistema (`sizeInBytes`, `mimeType`, etc.) son independientes de la metadata de usuario. | API, Metadata | 🆕 NUEVO |
| **RF-08** | **Autenticación y Autorización (IAM)** | El sistema debe autenticar cada petición antes de ejecutar cualquier operación sobre recursos. Debe verificar que el usuario autenticado tiene el permiso necesario sobre el recurso (`read`/`write` sobre un bucket específico). | Sin credenciales: `401 Unauthorized`. Credenciales válidas sin permiso: `403 Forbidden`. Todas las operaciones RF-01 a RF-07 deben fallar con `401`/`403` ante credenciales inválidas o ausentes. El pipeline CI debe incluir tests de seguridad para estos casos. | Auth, API | 🆕 NUEVO |
| **RF-09** | **Documentación y Testing vía OpenAPI** | La API debe generarse a partir de un contrato OpenAPI usando `openapi-generator-maven-plugin` (API-First). La documentación debe estar accesible desde Swagger UI y Scalar UI. | Ambas UIs deben listar todos los endpoints RF-01 a RF-08 con sus modelos de request/response, permitir ejecutar peticiones reales y mostrar los códigos de respuesta esperados. | API | ✅ EXISTENTE |

### 4.1 Modelo de Datos

#### Tabla: `users`

| Campo | Tipo Java | Tipo DB | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid` | Identificador único generado automáticamente (PK) |
| `username` | `String` | `varchar(128)` | Nombre de usuario único en el sistema |
| `passwordHash` | `String` | `varchar(255)` | Hash de la contraseña (bcrypt) |
| `createdAt` | `Instant` | `timestamptz` | Fecha de creación en UTC |

#### Tabla: `buckets`

| Campo | Tipo Java | Tipo DB | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid` | Identificador único (PK) |
| `name` | `String` | `varchar(255)` | Nombre del bucket — `UNIQUE` globalmente |
| `ownerId` | `UUID` | `uuid` | FK → `users.id` |
| `createdAt` | `Instant` | `timestamptz` | Fecha de creación en UTC |

#### Tabla: `objects`

| Campo | Tipo Java | Tipo DB | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid` | Identificador único del objeto/versión (PK) |
| `bucketId` | `UUID` | `uuid` | FK → `buckets.id` |
| `key` | `String` | `varchar(1024)` | Identificador del objeto con formato path (ej. `fotos/2024/img.jpg`). Único junto a `bucketId` + `versionId`. |
| `versionId` | `Long` | `bigint` | Número de versión auto-incremental por `(bucketId, key)`. Comienza en `1`. |
| `sizeInBytes` | `Long` | `bigint` | Tamaño del payload en bytes |
| `mimeType` | `String` | `varchar(128)` | Tipo MIME detectado desde el header `Content-Type` |
| `isLatest` | `Boolean` | `boolean` | `true` si es la versión más reciente de esta key. Facilita consultas de listado. |
| `deleted` | `Boolean` | `boolean` | Marca lógica de eliminación (soft delete) |
| `createdAt` | `Instant` | `timestamptz` | Fecha de creación en UTC |

> **Constraint de unicidad compuesto:** `UNIQUE (bucketId, key, versionId)`

#### Tabla: `object_metadata`

Almacena la metadata definida por el usuario como pares clave-valor, independientes de los campos del sistema.

| Campo | Tipo Java | Tipo DB | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid` | PK |
| `objectId` | `UUID` | `uuid` | FK → `objects.id` |
| `metaKey` | `String` | `varchar(256)` | Nombre del par (ej. `x-amz-meta-author`) |
| `metaValue` | `String` | `text` | Valor del par |

---

## 5. Referencia de Endpoints REST

| Método | RF | Path | Respuesta exitosa | Errores posibles |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | RF-01 | `/api/buckets/{bucketName}` | `201 Created` | 400, 401, 403, 409 |
| `PUT` | RF-02 | `/api/storage/{bucketName}/{objectKey}` | `201 Created` + `X-Version-Id` | 400, 401, 403, 404 |
| `GET` | RF-03, RF-06 | `/api/storage/{bucketName}/{objectKey}?versionId=N` | `200 OK` + stream | 401, 403, 404 |
| `DELETE` | RF-04 | `/api/storage/{bucketName}/{objectKey}?versionId=N` | `204 No Content` | 401, 403, 404 |
| `GET` | RF-05 | `/api/buckets/{bucketName}/objects?prefix=P&allVersions=false` | `200 OK` + array JSON | 401, 403, 404 |

---

## 6. Requisitos No Funcionales (RNF)

### 6.1 Empaquetado y Portabilidad

**RNF-01 — Multi-stage Dockerfile:** La aplicación debe compilarse y empaquetarse utilizando un `Dockerfile` de tipo *multi-stage build*, separando la etapa de compilación (con JDK) de la etapa de ejecución (con JRE).

**RNF-02 — Imagen liviana:** La imagen final de producción debe usar únicamente un JRE (no el JDK completo). Su peso final debe ser inferior a **250 MB**. Se recomienda usar `eclipse-temurin:26-jre-alpine` como base de la imagen de runtime.

**RNF-03 — Volumen de almacenamiento:** El `Dockerfile` debe declarar un `VOLUME` apuntando a `/app/storage`, permitiendo que los datos persistan fuera del ciclo de vida del contenedor.

### 6.2 Calidad y Pruebas

**RNF-04 — Aislamiento de Tests (CI Ready):** Todas las pruebas que involucren escritura en disco deben utilizar directorios temporales efímeros administrados por `@TempDir` de JUnit 5. Ningún test debe depender de rutas estáticas del sistema de archivos.

**RNF-05 — Cobertura mínima:** Los paquetes `*.storage.*`, `*.metadata.*` y `*.auth.*` deben mantener una cobertura de pruebas unitarias mínima del **80%**, validada automáticamente por JaCoCo. El pipeline de CI debe fallar si no se alcanza el umbral (`mvn verify`).

**RNF-06 — Tests de seguridad obligatorios:** El pipeline de CI debe incluir tests que verifiquen los comportamientos `401 Unauthorized` y `403 Forbidden` para todas las operaciones RF-01 a RF-07. Estos tests deben ejecutarse como parte de `mvn verify`.

**RNF-07 — Código generado a partir de OpenAPI:** El plugin `openapi-generator-maven-plugin` debe utilizarse para generar las interfaces del servidor Spring Boot a partir del archivo de especificación OpenAPI (`openapi.yaml`) durante la fase de build (enfoque API-First).

### 6.3 Rendimiento y Memoria

**RNF-08 — Streaming obligatorio:** El sistema **no debe** cargar objetos completos en la memoria RAM (heap de la JVM). Se debe usar `InputStream` / `OutputStream` o `StreamingResponseBody` de Spring. El consumo de memoria debe mantenerse estable independientemente del tamaño del archivo (1 MB o 500 MB).

### 6.4 Consistencia e Integridad

**RNF-09 — Atomicidad en la carga:** La operación de carga de un objeto debe ser atómica desde la perspectiva del cliente: si la escritura del payload en disco falla, no debe persistirse ningún metadato en la base de datos. Si la escritura de metadatos falla, el archivo en disco debe eliminarse (rollback físico). El estado del sistema debe ser siempre consistente.

**RNF-10 — Unicidad de nombre de bucket:** La unicidad del nombre del bucket debe garantizarse a nivel de base de datos mediante una restricción `UNIQUE` en la columna `name` de la tabla `buckets`. La capa de servicio debe interceptar la excepción de violación de constraint y retornar `409 Conflict` al cliente.
