# Guion de sustentación — HotelSync

Deck: `presentation/index.html` (14 diapositivas, 1280×720).
Duración objetivo: **30–35 minutos** + 10 de preguntas.

| Integrante | Rol | Diapositivas | Tiempo |
| --- | --- | --- | --- |
| Juan Diego Díaz | Arquitectura | 1–4 | ~8:30 |
| Juan Pablo Hernández | Backend | 5, 8, 9, 10 | ~10:00 |
| Marleidys Bautista | Frontend | 6, 13 | ~6:00 |
| María Ángel Correa | DevOps y calidad | 7, 11, 12, 14 | ~8:00 |

Reglas de la puesta en escena:

- Nadie lee la diapositiva: cada uno dice **qué se ve y por qué importa**.
- Un dato duro por diapositiva como máximo; el resto es razonamiento.
- Frases cortas. Si te trabas, vuelve al mensaje central de la slide.

---

## 1 · Portada — Juan Diego (1:30)

**Mensaje central:** HotelSync es un PMS modular para un hotel independiente, construido como once servicios con once bases y desplegado de verdad.

Guion:

- Saludo y presentación del equipo con los roles reales.
- "No venimos a mostrar un diagrama: venimos a mostrar un sistema que corre en producción y que puede reservar, recibir y facturar hoy."
- Contexto académico: Arquitectura de Plataformas Tecnológicas, Universidad Cooperativa de Colombia.
- Encuadre: "Cinco momentos: el problema, la arquitectura, los datos y eventos, la calidad y el despliegue, y la demo."

Respaldo: `hotelsync-front.vercel.app` está desplegado y con datos reales.

---

## 2 · Contexto y problema — Juan Diego (2:00)

**Mensaje central:** el problema no es "falta un software", es que cuatro roles necesitan el mismo hecho desde dueños de datos distintos.

Guion:

- Recorrer los cuatro dolores: sobreventa por inventario en hojas, check-in sin trazabilidad, limpieza sin cola, gerencia a ciegas.
- Cambiar de columna: cada rol pide algo distinto y eso descarta el monolito con una única base compartida.
- Remate: "La decisión de arquitectura nace acá: si cuatro roles miran datos de distinto dueño, hay que separar dueños."

Si preguntan por el alcance real del hotel: es un hotel demo, **Hotel Sync Centro**, con dos tipos de habitación (Standard Double y Deluxe Suite).

---

## 3 · Arquitectura general — Juan Diego (3:00)

**Mensaje central:** una petición atraviesa cuatro capas y cada capa tiene una responsabilidad que no invade la siguiente.

Guion:

- Capa 1, experiencia: Next.js con App Router; sitio público y `/admin` por rol.
- Capa 2, borde: BFF propio en `/api/*` y `api-gateway` sin estado con once prefijos.
- Capa 3, dominio: once servicios Express + TypeScript con `route → controller → service` y Zod en el borde.
- Capa 4, datos: una base por servicio, RabbitMQ, Redis y réplicas de lectura.
- Recorrer el diagrama de la derecha en ese orden, señalando que el gateway no autentica: valida cada servicio con el JWT.
- Remate: "El gateway uniforma el borde; no es un punto único de lógica."

Dato: el gateway corre en `hotelsync-api-gateway-tu1c.onrender.com` con timeout de 45 s hacia arriba.

---

## 4 · Objetivos y alcance — Juan Diego (2:00)

**Mensaje central:** el alcance se declara antes de defenderlo; lo que está afuera también es una decisión de arquitectura.

Guion:

- Los cuatro objetivos: ciclo completo, límites explícitos, tolerancia a fallos y costo cero.
- Leer el "dentro" y el "fuera" sin pedir disculpas: pagos simulados, sin OTAs certificadas, sin alta disponibilidad, sin facturación electrónica.
- Métricas de la franja inferior: 11 servicios, 41 modelos, 13 eventos, 399 pruebas.
- Remate: "Preferimos un sistema honesto y demostrable a uno ambicioso que no se puede sostener."

---

## 5 · Catálogo de servicios — Juan Pablo (3:00)

**Mensaje central:** once servicios con un dueño de dato claro; booking es el eje y el resto orbita.

Guion:

- Recorrer rápido los nombres y su dominio: property, rate-availability, user, booking, front-desk, housekeeping, billing, channel-manager, loyalty, payment, analytics.
- Señalar booking como hub: publica cuatro eventos y es el único que escribe reservas.
- Señalar rate-availability como árbitro del inventario: no es un catálogo, es quien decide si hay stock.
- Explicar la tarjeta oscura: 11 servicios, 41 modelos, 13 eventos, 9 colas, 7 publican y 8 consumen.
- Remate: "Si un servicio necesita una tabla de otro, la frontera está mal trazada."

Si preguntan por channel-manager: modela canales OTA y expone un simulador; no publica al exchange.

---

## 6 · BFF y sesión — Marleidys (3:00)

**Mensaje central:** el navegador nunca ve un token; el BFF es el único que conoce la red interna.

Guion:

- Recorrer los once prefijos y las rutas propias de auth.
- Explicar qué agrega el BFF: contrato estable, credenciales fuera del navegador, errores del servicio dueño, Auth0.
- Tabla de cookies: `hs_access` 15 minutos, `hs_refresh` 7 días o sesión, `hs_remember`, `theme` (no es credencial).
- Reglas: rotación del refresh, logout que borra ambas cookies, 401 que refresca una vez y reintenta, `Secure` y `SameSite Lax`.
- Remate: "La sesión vive en cookies HttpOnly; el JavaScript de la página no puede leer el token."

Si preguntan por el single-flight: varias peticiones simultáneas comparten una sola renovación en `/api/auth/refresh`.

---

## 7 · Seguridad en capas — María Ángel (2:00)

**Mensaje central:** el hardening se hizo por capas y con números verificables, no con intenciones.

Guion:

- Gateway: 600 req/min por IP, cuerpo máximo 1 MiB (413), URL máxima 2048 (414), timeouts 30/20/5 s, once prefijos y `x-request-id` regenerado.
- Servicios: login 20 por 15 min por IP y 5 por correo, registro 5/hora, headers `nosniff`, `DENY`, `no-referrer`, IP real con `trust proxy`.
- `assertProductionSecrets()`: el servicio no arranca sin secretos fuertes.
- Consumidores: tres reintentos con backoff 2 s / 15 s / 60 s y luego DLQ.
- Remate honesto: "El rate limit es en memoria, no distribuido; con más de una instancia habría que moverlo a Redis. Está en la slide de próximos pasos."

---

## 8 · Una base por servicio — Juan Pablo (2:30)

**Mensaje central:** la integridad no la da una clave foránea; la dan el borde, la idempotencia y los eventos.

Guion:

- Once bases PostgreSQL 16, 41 modelos, cero FKs cruzadas, UUID como identificador compartido.
- Sin joins entre bases: composición en el BFF o por HTTP interno.
- Analytics lee réplicas con el rol `hotelsync_analytics_ro`; no migra ni escribe en las bases de otros.
- Recorrer el "quién es dueño de qué": propiedad, inventario, reserva, llegada y folio, puntos.
- Remate: "Cada frontera coincide con un equipo de despliegue; si dos servicios comparten tabla, es un servicio con dos nombres."

---

## 9 · Eventos y outbox — Juan Pablo (3:00)

**Mensaje central:** el evento no se publica "además" del cambio: se escribe en la misma transacción.

Guion:

- Los cuatro pasos: outbox `pending` en la misma transacción, dispatcher cada 5–10 s, exchange `hotelsync.events` tipo topic, consumidor con ack manual.
- Retry acotado: 2 s, 15 s, 60 s con `x-retry-count`; al cuarto intento, `<cola>.dlq`.
- Idempotencia: `booking_id` único en llegadas, folios y puntos; `(booking_id, type)` en loyalty; `ProcessedEvent` y `AppliedKey` en R&A.
- Sin broker, el outbox queda `pending` y la operación continúa.
- Remate honesto: "No versionamos el esquema del evento; el contrato se sostiene por convención y pruebas. Es deuda declarada."

---

## 10 · Recorrido crítico — Juan Pablo (3:00)

**Mensaje central:** el flujo crítico se sostiene con una saga y con consistencia eventual, no con una transacción distribuida.

Guion:

- Recorrer los seis pasos: buscar, reservar `pending`, pagar, confirmar con versión optimista, llegar, salir.
- 409 si dos confirmaciones compiten; saga booking ↔ R&A con reconciliador cada 15 s y la misma clave.
- Si el inventario falla, el pago queda registrado y la saga reintenta: no se pierde plata.
- Sin doble check-in: `booking_id` UNIQUE en arrivals.
- Remate: "Cada paso puede fallar de forma visible y repetirse sin duplicar."

---

## 11 · Calidad y CI — María Ángel (2:00)

**Mensaje central:** lo que se prueba es lo que se despliega, y eso se nota en el número de pipelines.

Guion:

- 399 pruebas backend, 110 de frontend, 48 suites, 11 pipelines por split.
- Qué se prueba: contratos HTTP, idempotencia de consumidores, flujos de reserva, guards por rol, ETL idempotente.
- Qué corre en cada push: `tsc --noEmit`, `npm test`, `npm run build`, `prisma generate` y deploy.
- Remate honesto: "Sin E2E de navegador, sin staging y sin pruebas de carga. Sabemos exactamente qué falta."

---

## 12 · Despliegue en producción — María Ángel (2:30)

**Mensaje central:** un repositorio por servicio, una base por servicio y un health check que dice la verdad.

Guion:

- Recorrer la tabla por bloques, no fila por fila: los que responden 200 y los dos cuyo health está bloqueado por el broker (housekeeping y billing).
- Explicar por qué: `broker.connect()` en el arranque bloquea el health; el front tolera la caída y muestra la cola vacía.
- Infra: Render free, Neon Postgres, Vercel para el front, CloudAMQP; spin-down a los 15 min y arranque en frío de 30–90 s.
- Remate: "El free tier impone latencia, no impide demostrar el diseño; lo que cambia es la paciencia del jurado."

Sugerencia: si la demo es en vivo, **precalentar** los servicios cinco minutos antes de empezar.

---

## 13 · Demo en producción — Marleidys (3:00)

**Mensaje central:** cuatro roles, cuatro pantallas, los mismos datos reales.

Guion:

- GUEST: búsqueda pública sin login, fechas y tipos de habitación con precio del día.
- RECEPTIONIST: 46 reservas del hotel demo filtradas por estado; el check-in exige reserva confirmada.
- HOUSEKEEPER: cola del hotel al día; las tareas nacen del `checkout.completed`, con prioridad por salida.
- MANAGER: ocupación media 17,6 %, ADR $8.500, RevPAR $1.495 sobre 13 días con datos.
- Remate: "Esto no es un mockup: es el mismo sistema que acaban de ver en las diapositivas."

Plan B si falla la red: las capturas de esta diapositiva son la demo. No improvisar en vivo más de 90 segundos.

---

## 14 · Conclusiones y próximos pasos — María Ángel (2:30)

**Mensaje central:** lo entregado es verificable; lo que falta está dicho con nombre propio.

Guion:

- Lo entregado: once servicios, once bases, 41 modelos, 399 pruebas, demo con datos reales.
- Límites asumidos: free tier, pagos simulados, un solo entorno, sin trazas ni alertas.
- Próximos pasos: pasarela real con webhooks firmados, `schema_version` en eventos, staging y E2E, rate limit en Redis.
- Cerrar con la frase de la slide: "La arquitectura no se demuestra con un diagrama: se demuestra cuando un check-out dispara limpieza, factura y puntos sin que nadie los pida."
- Agradecer y quedar abiertos a preguntas.

---

## Preguntas probables del jurado

**¿Por qué microservicios y no un monolito modular?**
Porque el problema ya tiene cuatro dueños de dato distintos y un equipo que puede desplegar por separado. El costo lo asumimos: sin joins, sin transacción distribuida, más operación. Un monolito modular habría sido más barato de operar, pero no demostraba los límites que evalúa la materia.

**¿Cómo evitan perder un evento?**
Outbox transaccional: el cambio y la fila `pending` se escriben juntos. El dispatcher publica y marca `sent`. Si RabbitMQ no está, queda `pending` y la operación continúa.

**¿Qué pasa si dos personas confirman la misma reserva?**
Versión optimista: el segundo recibe 409 y vuelve a leer. El inventario se reserva con clave de idempotencia, así que un reintento no duplica.

**¿Cómo garantizan consistencia entre bases?**
No la garantizamos con una transacción global. Usamos saga con checkpoint (booking ↔ rate-availability) y consistencia eventual (checkout → housekeeping, billing, loyalty). Cada consumidor es idempotente.

**¿Dónde está el punto único de falla?**
El gateway y el broker. El gateway es sin estado y se puede replicar; el broker es un solo nodo en free tier. Está asumido y documentado.

**¿Qué no funciona hoy?**
La cuenta GUEST de producción está inválida: el flujo de huésped se demuestra con búsqueda pública. housekeeping y billing tienen el health bloqueado por el broker. No hay staging ni E2E.

**¿Por qué no usan claves foráneas entre servicios?**
Porque una FK entre bases crea acoplamiento de esquema y de despliegue. El UUID y la validación en el borde sostienen la referencia sin bloquear una migración independiente.

**¿Cómo escalaría si el hotel crece?**
Primero sacar el rate limit a Redis, después separar lecturas con réplicas, y recién ahí evaluar partición por hotel. El diseño actual ya permite escalar por servicio.

---

## Checklist previo a presentar

- [ ] `python -m http.server 5500 --directory presentation` y abrir `http://localhost:5500/index.html`.
- [ ] Precalentar gateway, property, rate, booking, front-desk y analytics (5 min antes).
- [ ] Verificar `https://hotelsync-front.vercel.app` en la misma máquina del proyector.
- [ ] Capturas de la slide 13 disponibles por si falla la red.
- [ ] PDF de respaldo generado con `Ctrl+P` desde el navegador.
