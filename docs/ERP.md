# Documento de Especificación de Requisitos (ERP)

**Proyecto:** S3-Lite 
**Versión:** 1.0.0
**Enfoque Principal:** Infraestructura como Código y Validación CI/CD  

---

## 1. Propósito y Alcance

El objetivo de este proyecto es desarrollar un servicio web ligero para el almacenamiento y recuperación de objetos (archivos y metadatos) que simule las capacidades operativas básicas de Amazon S3.

La filosofía principal es mantener el alcance de la aplicación **estrictamente acotado** para enfocar los esfuerzos en la automatización, pruebas y robustez del pipeline de CI/CD. No se debe agregar complejidad accidental ni funcionalidades no solicitadas explícitamente.

### Fuera de Alcance (Out of Scope)

* Autenticación, autorización ni gestión de usuarios (sin IAM).
* Compatibilidad con clientes nativos de AWS (AWS CLI, firmas SigV4).
* Interfaz gráfica de usuario (GUI) propia — se usarán interfaces de documentación de API estándar.
* Procesamiento distribuido, replicación de nodos o clustering.
* Paginación compleja o listado de buckets.

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

---

## 3. Arquitectura del Sistema

El sistema se diseña como una **aplicación monolítica ligera y autocontenida**, dividida en tres capas lógicas con responsabilidades claras, aplicando el principio de **Inversión de Dependencias** para mantener un desacoplamiento estricto entre capas:

```text
┌──────────────────────────────────────────────────────┐
│            Capa de API (REST + OpenAPI)               │
│    Expone endpoints y contratos de documentación      │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│          Capa de Servicio (Orquestación)               │
│     Coordina metadatos + almacenamiento físico         │
└──────────────┬────────────────────────┬───────────────┘
               │                        │
┌──────────────▼──────┐   ┌─────────────▼──────────────────┐
│    Metadatos        │   │   Almacenamiento Físico          │
│  (Persistencia JPA  │   │  (Abstracción sobre sistema    │
│   en DB Relacional) │   │   de archivos local)           │
└─────────────────────┘   └──────────────────────────────────┘
```

La **Capa de Almacenamiento Físico** se modela mediante una interfaz `StorageProvider` y su implementación concreta `FileSystemStorageProvider`, que utiliza `java.nio.file` para las operaciones de lectura/escritura en disco.

## 4. Requisitos Funcionales (RF)
 
| ID | Nombre | Descripción | Criterio de Aceptación (CI/CD) |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Subida / Sobrescritura de Objeto** | El sistema debe permitir subir un archivo a un bucket específico mediante `PUT /api/storage/{bucketName}/{fileName}`. El cuerpo de la petición es el flujo binario bruto del archivo. | Si el bucket no existe, debe crearse lógicamente. El archivo físico debe escribirse en disco. Los metadatos completos deben persistirse en la DB. La respuesta debe ser `201 Created`. |
| **RF-02** | **Descarga de Objeto** | El sistema debe devolver el contenido exacto de un archivo previamente subido mediante streaming a través de `GET /api/storage/{bucketName}/{fileName}`. | Si el objeto no existe en la DB, retornar `404 Not Found`. Si existe, retornar `200 OK` con `Content-Type` y `Content-Length` correctos y el contenido como stream. |
| **RF-03** | **Registro de Metadatos** | Por cada objeto subido, se deben extraer y persistir los campos indicados en la tabla de modelo. | La consulta a la base de datos debe reflejar exactamente todos los campos del payload original, sin discrepancias ni campos nulos. |
| **RF-04** | **Documentación y Testing vía OpenAPI** | La API debe generarse a partir de un contrato OpenAPI usando `openapi-generator-maven-plugin` (API-First). La documentación debe estar accesible desde dos interfaces de usuario: Swagger UI y Scalar UI. | Ambas UIs deben listar los dos endpoints con sus modelos de request/response, permitir ejecutar peticiones reales y mostrar los códigos de respuesta esperados. |

### Modelo de Metadatos (RF-03)
 
| Campo | Tipo Java | Tipo DB | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid` | Identificador único generado automáticamente |
| `bucketName` | `String` | `varchar(255)` | Nombre del bucket (partición lógica) |
| `fileName` | `String` | `varchar(255)` | Nombre original del archivo |
| `sizeInBytes` | `Long` | `bigint` | Tamaño del archivo en bytes |
| `mimeType` | `String` | `varchar(128)` | Tipo MIME detectado desde el header `Content-Type` |
| `createdAt` | `Instant` | `timestamptz` | Fecha y hora de creación (UTC) |
 
---
 
## 5. Requisitos No Funcionales (RNF) 
 
### 5.1. Empaquetado y Portabilidad
 
**RNF-01 — Multi-stage Dockerfile:** La aplicación debe compilarse y empaquetarse utilizando un `Dockerfile` de tipo *Multi-stage build*, separando la etapa de compilación (con JDK) de la etapa de ejecución (con JRE).
 
**RNF-02 — Imagen liviana:** La imagen final de producción debe usar únicamente un JRE (no el JDK completo). Su peso final debe ser inferior a **250 MB**. Se recomienda usar `eclipse-temurin:26-jre-alpine` como base de la imagen de runtime.
 
**RNF-03 — Volumen de almacenamiento:** El `Dockerfile` debe declarar un `VOLUME` apuntando a `/app/storage`, permitiendo que los datos persistan fuera del ciclo de vida del contenedor.
 
### 5.2. Calidad y Pruebas
 
**RNF-04 — Aislamiento de Tests (CI Ready):** Todas las pruebas que involucren escritura en disco deben utilizar directorios temporales efímeros administrados por `@TempDir` de JUnit 5. Ningún test debe depender de rutas estáticas del sistema de archivos.
 
**RNF-05 — Cobertura mínima:** La capa de almacenamiento físico (clases bajo el paquete `*.storage.*`) debe mantener una cobertura de pruebas unitarias mínima del **80%**, validada automáticamente por JaCoCo. El pipeline de CI debe fallar si no se alcanza el umbral (`mvn verify`).
 
**RNF-06 — Código generado a partir de OpenAPI:** El plugin `openapi-generator-maven-plugin` debe utilizarse para generar las interfaces del servidor Spring Boot a partir del archivo de especificación OpenAPI (`openapi.yaml`) durante la fase de build (enfoque API-First).
 
### 5.3. Rendimiento y Memoria
 
**RNF-07 — Streaming obligatorio:** El sistema **no debe** cargar objetos completos en la memoria RAM (heap de la JVM). Se debe usar `InputStream` / `OutputStream` o `StreamingResponseBody` de Spring. El consumo de memoria debe mantenerse estable independientemente del tamaño del archivo (1 MB o 500 MB).


