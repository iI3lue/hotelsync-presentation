# Presentación HotelSync

Deck web estático para la sustentación final. No requiere build, ni servidor, ni conexión a internet: todos los recursos (fuentes, diagramas, capturas) viven en esta carpeta.

## Cómo abrir

1. Doble clic en `presentation/index.html`, o
2. `npx serve presentation` y abrir `http://localhost:3000`.

En ambos casos funciona igual; la opción 2 es la recomendada para exponer desde otra máquina.

## Controles

| Tecla / acción | Efecto |
| --- | --- |
| `→`, `Espacio`, `PageDown` | Siguiente diapositiva |
| `←`, `PageUp` | Diapositiva anterior |
| `Home` / `End` | Primera / última |
| `F` | Pantalla completa |
| `#/n` en la URL | Ir directo a la diapositiva `n` |
| Clic en los puntos | Salto directo |
| Deslizar en táctil | Anterior / siguiente |

## Estructura

```
presentation/
├── index.html          diapositivas en HTML (una <section class="slide"> por slide)
├── styles.css          sistema visual (crema, tinta, latón; Gilda Display + Jost)
├── deck.js             motor de navegación, progreso, puntos y deep links
├── GUION.md            guion de sustentación por diapositiva y por integrante
└── assets/
    ├── fonts/          woff2 locales (sin Google Fonts)
    ├── diagrams/       diagramas exportados desde docs/diagramas
    └── demo/           capturas de producción usadas en la diapositiva 13
```

## Cómo agregar una diapositiva

1. Copiar un bloque `<section class="slide" data-title="…"> … </section>` dentro del `.stage`.
2. El contador, los puntos y la barra de progreso se recalculan solos.
3. Los elementos con `class="reveal"` y `style="--d:N"` entran escalonados (`N` en pasos de 55 ms).
4. La portada (`slide--cover`) es la única sin cabecera; conserva `is-active` como primer slide.

## Presentar

- Escenario fijo de 1280×720 escalado al proyector: no hay recortes ni scroll.
- Fondo oscuro alrededor del escenario: sirve como marco en pantallas 4:3.
- Respaldo: `Ctrl+P` → guardar como PDF (una diapositiva por página).

## Estado

- [x] Motor de navegación y sistema visual
- [x] Portada con equipo, stack y enlaces reales
- [x] Contexto y problema
- [x] Arquitectura general (figura de capas)
- [x] Objetivos y alcance
- [x] Catálogo de los 11 servicios
- [x] Seguridad
- [x] Outbox y eventos
- [x] Database-per-Service
- [x] Stack tecnológico
- [x] Pruebas, CI/CD y despliegue
- [x] Monitoreo
- [x] Demo funcional (capturas por rol)
- [x] Enlaces verificados
- [x] Conclusiones
