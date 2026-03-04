# Documento de Arquitectura y Lógica de Negocio
# Aplicación Web de Finanzas Personales
**Versión:** 1.0  
**Clasificación:** Arquitectura de Sistema — Documento Técnico Interno  
**Audiencia:** Desarrolladores Senior, Arquitectos de Software, Tech Leads  
**Fecha:** Marzo 2026

---

## TABLA DE CONTENIDOS

1. Visión General del Sistema
2. Arquitectura del Sistema
3. Modelado del Dominio (DDD)
4. Lógica de Negocio Financiera
5. Seguridad y Control
6. Principios de Ingeniería Aplicados
7. Reglas Financieras Importantes
8. Escalabilidad y Evolución
9. Consideraciones Técnicas Avanzadas

---

# 1. VISIÓN GENERAL DEL SISTEMA

## 1.1 Propósito del Sistema

La aplicación de finanzas personales tiene como propósito central ofrecer a individuos una plataforma digital robusta, segura y confiable para gestionar su vida económica de forma integral. El sistema se concibe no como una simple hoja de cálculo digitalizada, sino como un motor financiero personal capaz de registrar, procesar, analizar y proyectar el estado económico del usuario con precisión contable.

El sistema centraliza en un único punto todas las operaciones financieras relevantes para una persona natural: ingresos periódicos, egresos de toda naturaleza, ahorros con distintas estrategias, e ingresos extraordinarios de origen laboral o financiero. A partir de estos datos, el sistema calcula de forma determinista el estado financiero real del usuario en cualquier momento del tiempo.

## 1.2 Tipo de Usuarios

**Usuario Principal — Individuo Financiero Activo:**  
Persona entre 18 y 65 años con ingresos regulares (salario, honorarios, arriendos) que desea tener control real sobre sus finanzas. Puede tener o no conocimientos financieros previos. Registra manualmente sus movimientos y consulta reportes de estado.

**Usuario Avanzado (Futuro):**  
Individuo que gestiona múltiples fuentes de ingreso, tiene metas financieras de mediano y largo plazo, maneja inversiones básicas, y requiere proyecciones. Utiliza funcionalidades avanzadas de presupuesto y análisis.

**Usuario Familiar (Futuro):**  
Núcleo familiar donde uno o varios miembros comparten un pool financiero común, con visibilidades diferenciadas por rol (administrador, consultor, contribuyente).

## 1.3 Problema que Resuelve

La mayoría de las personas no tienen visibilidad clara sobre su situación financiera real. Los problemas concretos que resuelve este sistema son:

- **Falta de registro centralizado:** Los movimientos de dinero ocurren en múltiples canales (efectivo, tarjeta, transferencia) y no se consolidan.
- **Incapacidad para proyectar:** Sin datos históricos organizados, es imposible prever la situación futura.
- **Confusión entre ingreso ordinario y extraordinario:** Primas, bonificaciones e intereses de cesantías se mezclan con el ingreso regular, distorsionando la percepción del flujo de caja habitual.
- **Ausencia de estrategia de ahorro:** Sin una herramienta que separe y proteja porciones del ingreso, el ahorro queda subordinado al gasto.
- **Desconocimiento del patrimonio neto real:** El usuario desconoce cuánto vale lo que tiene menos lo que debe.

## 1.4 Alcance Actual

- Registro y autenticación de usuarios con cuentas privadas e irrestrictamente aisladas.
- Registro de ingresos ordinarios (recurrentes) y extraordinarios (no recurrentes).
- Registro de egresos categorizados.
- Gestión de secciones de ahorro con múltiples estrategias.
- Cálculo automático de balances, flujo de caja y estado financiero.
- Trazabilidad completa de todos los movimientos.

## 1.5 Visión Futura

- Gestión de presupuestos por categoría y período.
- Metas financieras con seguimiento automatizado de progreso.
- Reportes financieros avanzados (gráficos, tendencias, proyecciones).
- Soporte multi-moneda con conversión en tiempo real.
- Integraciones bancarias para sincronización automática de movimientos.
- Exportación de datos (PDF, CSV, Excel) para fines contables o fiscales.
- Módulo familiar con múltiples usuarios bajo una cuenta maestra.
- Alertas inteligentes sobre desviaciones presupuestales y oportunidades de ahorro.

---

# 2. ARQUITECTURA DEL SISTEMA

## 2.1 Tipo de Arquitectura Recomendada

**Clean Architecture con separación modular por dominio financiero.**

Esta decisión arquitectónica se fundamenta en los siguientes principios:

### Justificación Técnica

**a) Clean Architecture como base estructural:**  
Propuesta por Robert C. Martin, esta arquitectura garantiza que las reglas de negocio (el núcleo financiero del sistema) sean completamente independientes de frameworks, bases de datos, interfaces de usuario y cualquier agente externo. Esto es crítico en un sistema financiero donde las reglas de negocio son el activo más valioso y deben poder evolucionar, probarse y auditarse de forma independiente.

**b) Modularidad por dominio:**  
El sistema se divide en módulos claramente delimitados por contexto de negocio (Bounded Contexts en DDD): Identidad, Contabilidad Personal, Ahorro, Ingresos Extraordinarios. Esta separación permite que cada contexto evolucione de forma independiente sin generar acoplamiento rígido con los demás.

**c) Descartando Microservicios en la fase inicial:**  
Los microservicios introducen complejidad operativa (orquestación, red, consistencia eventual) que no está justificada para una aplicación mono-usuario en su fase inicial. Sin embargo, la modularidad interna garantiza que la migración futura a microservicios sea posible sin reescribir el dominio.

**d) Descartando Arquitectura Hexagonal pura:**  
La arquitectura hexagonal (Ports & Adapters) es conceptualmente compatible y se aplica a nivel módulo, pero Clean Architecture provee una nomenclatura más explícita sobre las capas y sus direcciones de dependencia, lo cual es preferible para equipos grandes.

## 2.2 Capas del Sistema y Responsabilidades

### Capa de Presentación (Interfaz de Usuario)

**Responsabilidad única:** Recibir intenciones del usuario y presentar resultados.

Esta capa es responsable exclusivamente de la interacción con el usuario. No contiene lógica de negocio, no realiza cálculos financieros, no valida reglas de dominio. Su trabajo es traducir acciones del usuario (clicks, formularios, comandos) en solicitudes comprensibles para la capa de aplicación mediante DTOs (Data Transfer Objects) bien definidos.

También es responsable de renderizar el estado del sistema en forma visual: balances, listas de movimientos, gráficas de ahorro. Toda información que muestra proviene de respuestas de la capa de aplicación, nunca de lógica interna.

**Principio clave:** La capa de presentación puede ser reemplazada por completo (web por mobile, o por una API REST) sin afectar en ninguna forma la lógica de negocio.

### Capa de Aplicación (Casos de Uso)

**Responsabilidad única:** Orquestar el flujo de las operaciones del sistema.

Esta capa contiene los casos de uso del sistema. Un caso de uso es una operación concreta que el sistema puede ejecutar: "Registrar un Ingreso", "Crear una Sección de Ahorro", "Calcular Balance del Período". Cada caso de uso recibe un comando o una query, ejecuta la secuencia de operaciones necesarias coordinando entidades del dominio y repositorios, y retorna un resultado.

Esta capa NO contiene lógica de negocio financiera. No decide si un movimiento es válido, no calcula si hay saldo suficiente para ahorrar. Delega esas responsabilidades al dominio. Su trabajo es coordinar, no decidir.

Los casos de uso también son el punto de entrada para los eventos de dominio: capturan qué ocurrió y disparan las reacciones del sistema (notificaciones, actualizaciones de estado, logs de auditoría).

### Capa de Dominio (Núcleo de Negocio)

**Responsabilidad única:** Contener y proteger las reglas de negocio financiero.

Esta es la capa más importante y el corazón intelectual del sistema. Aquí residen las Entidades, los Agregados, los Objetos de Valor, los Eventos de Dominio y las Reglas de Negocio. Esta capa es completamente agnóstica a cualquier tecnología: no conoce bases de datos, no conoce HTTP, no conoce el framework de frontend.

Las reglas de negocio aquí son inmutables ante cambios tecnológicos. Si mañana se cambia la base de datos de SQL a NoSQL, o el frontend de React a Vue, el dominio permanece inalterado. Esta es la garantía de longevidad del sistema.

Las invariantes del dominio (condiciones que siempre deben ser verdaderas) se protegen dentro de los propios objetos de dominio. Un Agregado no puede quedar en un estado inválido.

### Capa de Infraestructura (Adaptadores Técnicos)

**Responsabilidad única:** Implementar las interfaces definidas por el dominio usando tecnologías concretas.

Esta capa contiene las implementaciones concretas de los repositorios (acceso a base de datos), servicios de terceros (envío de emails, notificaciones), adaptadores de autenticación, sistemas de caché, y cualquier componente técnico. El dominio define interfaces (contratos abstractos); la infraestructura los implementa.

La regla de dependencia es absoluta: la infraestructura depende del dominio, nunca al revés. El dominio no sabe cómo se persiste un dato; solo sabe qué datos deben persistirse.

## 2.3 Flujo de Datos Interno

El flujo de datos sigue un camino unidireccional y controlado:

```
Usuario → [Presentación] → Comando/Query → [Aplicación] → Entidades de Dominio
→ [Dominio aplica reglas] → [Infraestructura persiste] → Resultado → [Aplicación]
→ DTO de Respuesta → [Presentación] → Usuario
```

**Principio de inversión de dependencias:** Las capas internas (dominio) definen las interfaces. Las capas externas (infraestructura) las implementan. Nunca al revés.

---

# 3. MODELADO DEL DOMINIO (DDD)

## 3.1 Bounded Contexts (Contextos Delimitados)

El sistema se divide en los siguientes contextos de negocio, cada uno con su propio modelo, lenguaje ubicuo y reglas:

| Contexto | Responsabilidad |
|---|---|
| **Identidad** | Registro, autenticación y gestión de sesiones de usuario |
| **Contabilidad Personal** | Registro y procesamiento de ingresos y egresos ordinarios |
| **Ahorro** | Gestión de secciones de ahorro y estrategias de acumulación |
| **Ingresos Extraordinarios** | Manejo de flujos no recurrentes de origen laboral o financiero |
| **Reportes** *(futuro)* | Generación de estados financieros y proyecciones |

## 3.2 Entidades Principales

### Entidad: Usuario (User)

Representa a la persona titular de la cuenta financiera. Es el anchor de todo el modelo de datos. Todo objeto financiero en el sistema pertenece a exactamente un Usuario.

**Atributos clave:** identificador único inmutable, credenciales de autenticación (separadas en subentidad por seguridad), fecha de registro, estado de cuenta (activo, suspendido, eliminado lógicamente), preferencias de configuración (moneda base, zona horaria).

**Reglas de negocio:**
- Dos usuarios no pueden compartir el mismo identificador de correo electrónico.
- El estado `eliminado lógicamente` no destruye los datos financieros; estos se archivan por razones de auditoría.
- Las credenciales de autenticación son un subdominio separado; el Usuario financiero no maneja contraseñas directamente.

### Entidad: Movimiento Financiero (FinancialTransaction)

Representa cualquier evento que modifica el estado financiero del usuario. Es la unidad atómica del sistema de contabilidad personal.

**Atributos clave:** identificador único, tipo (ingreso/egreso), subtipo (ordinario/extraordinario), monto con precisión decimal controlada, moneda, fecha del movimiento, fecha de registro en el sistema, categoría, descripción, estado (pendiente, confirmado, anulado), origen del registro (manual, importado), usuario propietario.

**Reglas de negocio:**
- Un movimiento confirmado NUNCA se elimina físicamente. Solo puede ser anulado, generando un movimiento compensatorio.
- El monto siempre es positivo; el tipo (ingreso/egreso) determina su efecto en el balance.
- La fecha del movimiento (cuando ocurrió) puede diferir de la fecha de registro (cuando se ingresó al sistema). Esta distinción es crítica para la integridad del historial.
- Un movimiento anulado genera automáticamente un Evento de Dominio `MovimientoAnulado` que actualiza los balances afectados.

### Entidad: Sección de Ahorro (SavingsSection)

Representa un espacio separado y nominado donde el usuario acumula recursos con un propósito específico.

**Atributos clave:** identificador único, nombre descriptivo, objetivo/propósito, estrategia de ahorro (fijo, porcentual, por meta), monto objetivo (opcional), monto acumulado actual, estado (activo, pausado, completado, disuelto), fecha de inicio, fecha objetivo (opcional), usuario propietario.

**Reglas de negocio:**
- El monto acumulado nunca puede ser negativo.
- Una sección `completada` no puede recibir nuevas aportaciones hasta ser reactivada o disuelta.
- La disolución de una sección transfiere el saldo acumulado al balance general del usuario, generando un ingreso de tipo "Liberación de Ahorro".
- Una sección no puede ser eliminada si tiene un saldo mayor a cero sin proceso de disolución explícito.

### Entidad: Ingreso Extraordinario (ExtraordinaryIncome)

Representa flujos de dinero de origen no recurrente con naturaleza laboral, prestacional o financiera.

**Atributos clave:** identificador único, tipo de ingreso extraordinario (prima, interés de cesantías, bonificación, otro), monto bruto, monto neto (después de retenciones si aplica), período al que corresponde, fecha de recepción, descripción de origen, usuario propietario.

**Reglas de negocio:**
- El tipo de ingreso extraordinario determina las reglas de procesamiento: una prima tiene período semestral/anual; los intereses de cesantías tienen calendario específico; una bonificación puede ser ad-hoc.
- El sistema distingue entre el monto bruto y el monto neto para permitir reportes de carga fiscal futura.
- Los ingresos extraordinarios se procesan siempre fuera del flujo de caja ordinario del período para no distorsionar el análisis de ingresos recurrentes.

## 3.3 Objetos de Valor (Value Objects)

Los objetos de valor son inmutables y se identifican por sus atributos, no por identidad.

**Dinero (Money):**  
Encapsula un monto numérico y una moneda. El monto usa precisión decimal de alta resolución (mínimo 4 decimales internos, presentados con 2 al usuario). Dos objetos Dinero son iguales si tienen el mismo monto y la misma moneda. Las operaciones sobre Dinero siempre retornan un nuevo objeto Dinero; nunca mutan el original. El sistema rechaza operaciones aritméticas entre objetos Dinero de monedas diferentes sin conversión explícita.

**Período (Period):**  
Encapsula un rango de tiempo con fecha de inicio y fecha de fin. Se usa para delimitar consultas de balance, cálculos de flujo de caja, y aplicación de estrategias de ahorro periódicas. Un Período es válido solo si la fecha de fin es posterior o igual a la fecha de inicio.

**Categoría (Category):**  
Etiqueta semántica que clasifica movimientos. Es un objeto de valor porque su identidad está en su nombre y tipo, no en un ID artificial. Las categorías predefinidas del sistema son inmutables; el usuario puede crear categorías personalizadas que sí tienen identidad propia y se convierten en entidades.

**Porcentaje (Percentage):**  
Encapsula un valor entre 0 y 100 con precisión decimal. Se usa en estrategias de ahorro porcentuales. El sistema rechaza instanciar un Porcentaje fuera de este rango.

**Estrategia de Ahorro (SavingsStrategy):**  
Objeto de valor que encapsula el mecanismo de cálculo de la aportación a una sección de ahorro. Puede ser de tipo: Fijo (monto fijo por período), Porcentual (porcentaje del ingreso neto del período), o Por Meta (monto calculado para alcanzar el objetivo en la fecha objetivo).

## 3.4 Agregados y Raíces de Agregado

Un Agregado es un cluster de entidades y objetos de valor que se tratan como una unidad para cambios de estado.

**Agregado: Cuenta Financiera del Usuario (UserFinancialAccount)**

Raíz de agregado: `UserFinancialAccount`  
Contiene: colección de `FinancialTransaction`, colección de `SavingsSection`

Esta es la entidad de mayor jerarquía en el dominio financiero. Toda operación que modifique el estado financiero del usuario pasa a través de esta raíz de agregado. Esto garantiza que las invariantes de consistencia se mantengan siempre:
- El balance calculado siempre refleja exactamente la suma de movimientos confirmados.
- Las aportaciones a secciones de ahorro se procesan como egresos internos antes de confirmar el saldo libre disponible.
- Ningún movimiento puede ser registrado sobre una cuenta en estado suspendido.

**Agregado: Sesión de Identidad (IdentitySession)**

Raíz de agregado: `IdentitySession`  
Pertenece al Bounded Context de Identidad, separado del contexto financiero. Esta separación garantiza que un compromiso de seguridad en la capa de autenticación no afecta directamente el modelo financiero.

## 3.5 Invariantes del Dominio

Las invariantes son condiciones que el sistema debe garantizar en todo momento, sin excepción:

1. **Invariante de Integridad de Balance:** El balance disponible de un usuario siempre es igual a la suma de todos sus ingresos confirmados menos la suma de todos sus egresos confirmados, incluyendo las aportaciones a secciones de ahorro como egresos.

2. **Invariante de No Negatividad de Ahorro:** El saldo de una sección de ahorro nunca puede ser menor a cero.

3. **Invariante de Inmutabilidad de Movimientos Confirmados:** Un movimiento en estado `confirmado` no puede modificar su monto, tipo ni fecha del movimiento. Solo puede ser anulado mediante el patrón de compensación.

4. **Invariante de Aislamiento de Usuario:** Ningún dato financiero de un usuario puede ser accedido, modificado o referenciado por otro usuario bajo ninguna circunstancia dentro del dominio.

5. **Invariante de Moneda Consistente:** Todas las operaciones aritméticas de balance dentro de un período usan la moneda base del usuario. Los movimientos en moneda extranjera requieren conversión explícita antes de afectar el balance.

6. **Invariante de Continuidad del Historial:** El historial de movimientos es append-only. Las anulaciones se registran como nuevas entradas, no como modificaciones. Esto garantiza un log de auditoría completo e inalterable.

## 3.6 Eventos de Dominio

Los eventos de dominio representan hechos que ocurrieron en el dominio y que pueden tener consecuencias en otros contextos.

| Evento | Disparador | Consecuencias |
|---|---|---|
| `IngresoRegistrado` | Se confirma un ingreso | Actualización de balance, notificación opcional, log de auditoría |
| `EgresoRegistrado` | Se confirma un egreso | Actualización de balance, verificación de saldo, log de auditoría |
| `MovimientoAnulado` | Se anula un movimiento confirmado | Movimiento compensatorio, recálculo de balances, log de auditoría |
| `AportacionAhorroRealizada` | Se aporta a una sección de ahorro | Egreso interno registrado, saldo de sección actualizado |
| `MetaAhorroAlcanzada` | Saldo de sección ≥ objetivo | Notificación al usuario, estado de sección a `completado` |
| `IngresoExtraordinarioRecibido` | Se registra ingreso no recurrente | Procesado fuera de flujo ordinario, log diferenciado |
| `SesionIniciada` | Usuario autentica exitosamente | Log de acceso, renovación de token |
| `IntentofautendicaciónFallido` | Credenciales inválidas | Incremento de contador de intentos, posible bloqueo temporal |

## 3.7 Casos de Uso

**Contexto de Identidad:**
- Registrar nuevo usuario
- Autenticar usuario (login)
- Cerrar sesión
- Solicitar recuperación de contraseña
- Cambiar contraseña

**Contexto de Contabilidad Personal:**
- Registrar ingreso ordinario
- Registrar egreso
- Anular movimiento
- Consultar balance del período
- Consultar historial de movimientos con filtros
- Calcular flujo de caja de un período

**Contexto de Ahorro:**
- Crear sección de ahorro
- Realizar aportación a sección de ahorro
- Retirar parcialmente de sección de ahorro
- Pausar sección de ahorro
- Disolver sección de ahorro
- Consultar estado de secciones de ahorro

**Contexto de Ingresos Extraordinarios:**
- Registrar prima
- Registrar interés de cesantías
- Registrar bonificación
- Registrar ingreso extraordinario genérico
- Consultar historial de ingresos extraordinarios
- Calcular total de ingresos extraordinarios por período

---

# 4. LÓGICA DE NEGOCIO FINANCIERA

## 4.1 Registro de Ingresos Ordinarios

Un ingreso ordinario representa una entrada de dinero recurrente y predecible: salario mensual, honorarios por servicios, ingresos por arrendamiento, entre otros.

**Proceso de registro:**

1. El usuario provee: monto, fecha del movimiento, categoría, fuente (quién paga), descripción.
2. El sistema valida que el monto sea positivo y en moneda válida.
3. El sistema crea el movimiento en estado `pendiente` inicialmente, permitiendo revisión antes de confirmar.
4. Al confirmar, el sistema actualiza automáticamente el balance del período correspondiente.
5. Se dispara el evento `IngresoRegistrado`.

**Clasificación del ingreso ordinario:**

El sistema distingue automáticamente entre ingresos recurrentes (ocurren en intervalos regulares: mensual, quincenal) e ingresos ordinarios únicos (ocurren una vez pero son de naturaleza ordinaria, no extraordinaria). Esta distinción es fundamental para la proyección futura y el análisis de flujo de caja sostenible.

**Ingreso neto disponible:**  
Una vez registrado el ingreso, el sistema calcula el ingreso neto disponible del período, que es el ingreso confirmado menos los compromisos automáticos de ahorro activos (si el usuario configuró estrategias de ahorro automáticas sobre el ingreso). Este valor es el que el usuario tiene efectivamente para gastar.

## 4.2 Registro de Egresos

Un egreso representa cualquier salida de dinero: gastos de consumo, pagos de servicios, deudas, inversiones.

**Categorías de egreso:**

- **Gastos fijos:** Arriendo, cuotas de crédito, servicios públicos. Monto conocido y predecible.
- **Gastos variables esenciales:** Mercado, transporte, salud. Monto variable pero necesario.
- **Gastos variables discrecionales:** Entretenimiento, ropa, restaurantes. Monto y ocurrencia electivo.
- **Gastos de inversión:** Compra de activos, educación formal. Generan valor futuro.
- **Gastos de deuda:** Pago de obligaciones financieras. Reducen el pasivo.

**Proceso de registro:**

1. El usuario provee: monto, fecha, categoría, beneficiario, descripción.
2. El sistema valida que el monto sea positivo.
3. El sistema verifica que el balance disponible cubra el egreso. Si no, emite una advertencia (no bloqueante por defecto, puede configurarse como bloqueante).
4. El movimiento se registra como confirmado directamente (o en estado pendiente si el usuario lo prefiere).
5. Se actualiza el balance del período y se dispara `EgresoRegistrado`.

**Validaciones:**

El sistema no bloquea por defecto un egreso que excede el balance disponible, porque la realidad financiera lo permite (el usuario puede tener el dinero en efectivo). Sin embargo, el sistema sí registra el estado de "balance negativo" como alerta crítica visible.

## 4.3 Cálculo de Balances

El balance es la fotografía financiera del usuario en un momento o período dado.

**Balance del Período:**
```
Balance del Período = ΣIngresos confirmados del período − ΣEgresos confirmados del período
```
Donde los egresos incluyen las aportaciones a secciones de ahorro (que son egresos de la cuenta general, aunque no salgan del patrimonio total).

**Balance Disponible:**
```
Balance Disponible = Balance del Período − Compromisos de ahorro no ejecutados del período
```

**Balance Acumulado (Patrimonial):**
```
Balance Acumulado = ΣTodos los ingresos históricos − ΣTodos los egresos históricos
```

**Patrimonio Neto:**
```
Patrimonio Neto = Activos declarados + ΣSaldos en secciones de ahorro + Balance disponible − Pasivos declarados
```

**Reglas del cálculo de balance:**

- Solo movimientos en estado `confirmado` afectan el balance. Los movimientos `pendientes` no se cuentan.
- Los movimientos `anulados` se neutralizan mediante el movimiento compensatorio registrado.
- El balance siempre se calcula mediante la suma histórica de transacciones (no mediante un campo "balance" actualizado). Esto garantiza trazabilidad total y permite auditoría en cualquier punto del tiempo.
- Para optimización de rendimiento, se pueden usar snapshots de balance periódicos como caché, pero el cálculo real siempre parte del log de transacciones.

## 4.4 Manejo de Ingresos Extraordinarios

Los ingresos extraordinarios son flujos de dinero que no forman parte del ciclo ordinario de ingresos del usuario y provienen de eventos específicos del entorno laboral o financiero.

### Prima (Bonus Extralegal / Legal)

La prima es un pago adicional que el empleador realiza al empleado en períodos específicos (generalmente semestral en Colombia: junio y diciembre).

**Lógica de procesamiento:**
- Se registra con tipo `IngresoExtraordinario`, subtipo `Prima`.
- El período de la prima (primer o segundo semestre) se registra explícitamente.
- El sistema diferencia entre prima legal (obligatoria por ley) y prima extralegal (beneficio adicional).
- El monto neto se calcula después de descontar retención en la fuente si el usuario lo especifica.
- La prima NO se incluye en el cálculo del flujo de caja ordinario mensual; aparece separada en los reportes para no distorsionar el análisis de ingreso recurrente.
- El sistema puede sugerir al usuario una estrategia de asignación de la prima: porcentaje a ahorro, porcentaje a deudas, porcentaje disponible.

### Intereses de Cesantías

Los intereses de cesantías son un pago obligatorio del empleador equivalente al 12% anual sobre el saldo de cesantías del año anterior, pagadero antes del 31 de enero.

**Lógica de procesamiento:**
- Se registra con tipo `IngresoExtraordinario`, subtipo `InteresCesantias`.
- El año fiscal al que corresponden los intereses se registra explícitamente.
- El monto esperado puede proyectarse si el usuario ingresa su saldo de cesantías: `Saldo Cesantías × 12% / 360 × días del año`.
- Los intereses son exentos de retención en la fuente en Colombia; el sistema debe permitir marcar el movimiento como exento.
- Se procesan fuera del flujo ordinario mensual.

### Bonificaciones

Las bonificaciones son pagos adicionales discrecionales del empleador por productividad, cumplimiento de metas o reconocimientos especiales.

**Lógica de procesamiento:**
- Se registra con tipo `IngresoExtraordinario`, subtipo `Bonificacion`.
- Pueden ser recurrentes en un patrón (trimestral, anual) pero el sistema las trata siempre como no recurrentes hasta que el usuario las "normaliza" explícitamente.
- El sistema permite registrar la bonificación bruta y el neto después de retención.

### Ingresos Adicionales No Recurrentes

Cualquier ingreso que no encaje en las categorías anteriores: ventas de bienes usados, rifas, premios, herencias, devoluciones de impuestos.

**Lógica de procesamiento:**
- Se registra con tipo `IngresoExtraordinario`, subtipo `OtroNoRecurrente`.
- El usuario especifica una descripción de origen.
- Se mantiene fuera del análisis de flujo de caja ordinario.

## 4.5 Lógica de Ahorro

El ahorro es un primer ciudadano del dominio. No es un remanente del gasto; es una asignación intencional y prioritaria.

### Ahorro Fijo

El usuario especifica un monto fijo a transferir a una sección de ahorro en cada período (mensual, quincenal, semanal).

**Proceso:**
- Al confirmar el período (o automáticamente si así se configura), el sistema ejecuta la aportación fija.
- La aportación se registra como un egreso de tipo `AportacionAhorro` en la cuenta general.
- El mismo monto se acredita en la sección de ahorro correspondiente.
- Si el ingreso del período no cubre la aportación fija, el sistema alerta al usuario pero no ejecuta la aportación automáticamente; requiere confirmación explícita.

### Ahorro por Porcentaje

El usuario especifica un porcentaje de sus ingresos netos del período a destinar a una sección de ahorro.

**Proceso:**
- Al cierre de cada período (o al confirmar un ingreso), el sistema calcula el monto de aportación:  
  `Monto Aportación = Ingreso Neto del Período × Porcentaje`
- Este cálculo usa el ingreso ordinario neto, excluyendo por defecto los ingresos extraordinarios (a menos que el usuario lo configure distinto).
- La aportación se registra igual que en el esquema fijo.

### Ahorro por Meta

El usuario define el monto objetivo y la fecha objetivo. El sistema calcula automáticamente el monto mensual necesario para alcanzar la meta.

**Proceso:**
- `Monto Mensual Necesario = (Objetivo − Saldo Actual) ÷ Meses Restantes`
- El sistema recalcula este valor en cada período para ajustarse si hubo aportaciones extra o si el usuario cambió el objetivo o la fecha.
- Al alcanzar el 100% del objetivo, el sistema dispara el evento `MetaAhorroAlcanzada` y notifica al usuario.
- Si la fecha objetivo ya pasó sin haber alcanzado la meta, el sistema marca la sección como `vencida` pero no la disuelve automáticamente; requiere acción del usuario.

### Retiros Parciales de Ahorro

El usuario puede retirar fondos de una sección de ahorro antes de alcanzar la meta.

**Proceso:**
- El retiro parcial se registra como una operación de tipo `RetiroAhorro`.
- El monto retirado se acredita al balance general del usuario como un ingreso de tipo `RetiroAhorro`.
- El saldo de la sección se reduce en el monto retirado.
- Si el retiro es total, el sistema verifica si el usuario desea disolver la sección o mantenerla con saldo cero para futuros aportes.
- El sistema puede mostrar el impacto del retiro sobre la fecha de consecución de la meta (si aplica).

## 4.6 Validaciones Financieras

**Validaciones de entrada:**
- Montos: siempre positivos, nunca nulos, dentro de límites razonables para prevenir errores de entrada (ej. máximo por transacción configurable).
- Fechas: la fecha del movimiento no puede ser futuro lejano (máximo N días en el futuro configurable). Puede ser pasada (corrección de registros olvidados).
- Categorías: deben existir en el catálogo activo del usuario.
- Moneda: debe ser una ISO 4217 válida.

**Validaciones de integridad:**
- Un usuario no puede operar sobre cuentas que no le pertenecen.
- Las aportaciones de ahorro no pueden exceder el balance disponible (advertencia configurable como error).
- Los retiros de ahorro no pueden exceder el saldo de la sección.

---

# 5. SEGURIDAD Y CONTROL

## 5.1 Modelo de Autenticación

**Autenticación basada en credenciales con tokens de sesión firmados.**

El proceso de autenticación opera en el Bounded Context de Identidad, completamente separado del contexto financiero. Esta separación garantiza que el modelo financiero no expone información de autenticación y viceversa.

**Flujo de autenticación:**

1. El usuario provee identificador (email) y secreto (contraseña).
2. El sistema verifica la existencia del usuario por identificador.
3. El sistema verifica el secreto contra el hash almacenado usando un algoritmo de hashing de contraseñas resistente a ataques de fuerza bruta (bcrypt, Argon2 o scrypt, con factor de costo adecuado al hardware).
4. Si la verificación es exitosa, el sistema emite un token de sesión firmado con tiempo de expiración corto (15-60 minutos para el token de acceso) y un token de renovación de larga duración (7-30 días).
5. El token de acceso viaja en cada solicitud; el token de renovación se usa exclusivamente para emitir nuevos tokens de acceso sin requerir re-autenticación.

**Principios de almacenamiento de contraseñas:**
- Las contraseñas NUNCA se almacenan en texto plano.
- Se almacena el hash generado con sal (salt) único por usuario.
- El sal es generado aleatoriamente con entropía criptográfica.
- El algoritmo de hashing debe ser configurable para migración futura sin perder contraseñas existentes.

## 5.2 Modelo de Autorización

**Autorización basada en propiedad de recursos.**

En esta fase inicial, el modelo de autorización es simple: cada recurso financiero pertenece a exactamente un usuario, y solo ese usuario puede acceder o modificar ese recurso. No existen roles complejos inicialmente.

**Regla de autorización universal:** Antes de cualquier operación de lectura o escritura sobre un recurso financiero, el sistema verifica que el `userId` del token de la sesión activa coincide con el `ownerId` del recurso solicitado. Si no coincide, la operación es rechazada con un error de autorización. Este rechazo no revela si el recurso existe o no.

**Evolución futura:** El modelo soportará roles cuando se implemente el módulo familiar: Administrador (acceso total), Editor (registro de movimientos), Consultante (solo lectura).

## 5.3 Protección de Datos Financieros

**Datos en reposo:**  
Toda información financiera se almacena cifrada. Los campos de alto valor (montos, saldos, información de cuenta) usan cifrado a nivel de columna o campo en la base de datos, adicionalmente al cifrado del volumen de almacenamiento.

**Datos en tránsito:**  
Toda comunicación entre cliente y servidor usa TLS 1.3 como mínimo. No se permiten conexiones HTTP planas a rutas financieras.

**Principio de mínima exposición:**  
Las respuestas de la API solo incluyen los campos estrictamente necesarios para la operación solicitada. Los identificadores internos se exponen como IDs opacos (UUIDs), nunca como identificadores secuenciales que permitan inferir el volumen de datos del sistema.

**Retención de datos:**  
Los datos financieros de un usuario que cierra su cuenta se retienen por el período legal aplicable (regulación financiera local) antes de ser eliminados definitivamente.

## 5.4 Manejo de Sesiones

- Las sesiones son stateless del lado del servidor (JWT). El estado de sesión se verifica mediante la validez criptográfica del token, no mediante consulta a base de datos en cada solicitud (optimización de rendimiento).
- El token de renovación sí se registra en base de datos para permitir la revocación explícita (logout en todos los dispositivos, compromiso de seguridad detectado).
- El sistema mantiene un registro de sesiones activas (dispositivo, IP, fecha de último uso) visible para el usuario, permitiéndole revocar sesiones específicas.
- Tiempo de inactividad: sesiones sin actividad por N minutos (configurable) son invalidadas automáticamente en el cliente.

## 5.5 Prevención de Fraude Interno

**Bloqueo por intentos fallidos:** Después de N intentos de autenticación fallidos (configurable, default 5) en X minutos, la cuenta se bloquea temporalmente con bloqueo exponencial (la siguiente espera duplica a la anterior).

**Detección de patrones anómalos:** El sistema registra metadata de acceso (IP, user agent, hora) y puede detectar accesos desde ubicaciones o dispositivos nunca antes usados, solicitando verificación adicional.

**Principio de No Repudio:** Toda operación financiera queda registrada con el identificador de sesión que la ejecutó, permitiendo rastrear en caso de disputa quién realizó qué operación.

---

# 6. PRINCIPIOS DE INGENIERÍA APLICADOS

## 6.1 SOLID

**Single Responsibility Principle:**  
Cada clase, módulo y función tiene una única razón para cambiar. El caso de uso `RegistrarIngreso` no calcula balances; delega esa responsabilidad al servicio de dominio `BalanceCalculator`. El repositorio de transacciones no tiene lógica de negocio; solo persiste y consulta.

**Open/Closed Principle:**  
Las estrategias de ahorro son un ejemplo canónico: existe una interfaz `SavingsStrategy` y múltiples implementaciones (`FixedSavingsStrategy`, `PercentageSavingsStrategy`, `GoalBasedSavingsStrategy`). Agregar una nueva estrategia (ej. ahorro por rondas) solo requiere implementar la interfaz, sin modificar código existente.

**Liskov Substitution Principle:**  
Cualquier implementación de `TransactionRepository` (en memoria para tests, PostgreSQL para producción, MongoDB para migración futura) puede ser sustituida sin que el dominio lo perciba.

**Interface Segregation Principle:**  
Los repositorios se segregan por responsabilidad de lectura y escritura cuando la carga lo justifica. Existe `TransactionReadRepository` para consultas y `TransactionWriteRepository` para escrituras, con implementaciones que pueden diferir tecnológicamente (CQRS preparado).

**Dependency Inversion Principle:**  
El dominio define la interfaz `ITransactionRepository`. La infraestructura implementa `PostgresTransactionRepository`. El caso de uso recibe la interfaz por inyección de dependencias, nunca la implementación concreta.

## 6.2 DRY (Don't Repeat Yourself)

La lógica de cálculo de balance existe en un único lugar del dominio. Los casos de uso de consulta de balance del período, generación de reporte mensual, y verificación de saldo para aportación de ahorro todos usan el mismo servicio de dominio `BalanceCalculator`. No existe código duplicado de cálculo en múltiples lugares.

## 6.3 KISS (Keep It Simple, Stupid)

El diseño prefiere soluciones simples y comprensibles sobre soluciones elegantes pero complejas. El sistema de eventos de dominio usa un bus de eventos en memoria simple antes de considerar sistemas de mensajería distribuida. La complejidad se agrega solo cuando el problema la requiere, no por anticipación.

## 6.4 YAGNI (You Ain't Gonna Need It)

El sistema no implementa funcionalidades multi-moneda en la fase inicial aunque la arquitectura las contempla. El objeto de valor `Money` incluye el campo `currency` desde el inicio (YAGNI no es excusa para no modelar bien), pero la lógica de conversión de monedas no existe hasta que sea requerida. La arquitectura es extensible; la implementación es minimalista.

## 6.5 DDD (Domain-Driven Design)

El lenguaje ubicuo permea todo el sistema. Los términos del negocio financiero personal (`ingreso`, `egreso`, `saldo`, `sección de ahorro`, `prima`, `cesantía`) son los mismos en el código, en los documentos, en las conversaciones del equipo y en la interfaz de usuario. No hay traducción conceptual entre capas.

Los modelos de dominio son ricos en comportamiento. Una `SavingsSection` no es solo datos; tiene métodos como `depositar()`, `retirar()`, `calcularProgreso()`, `disolver()`. La lógica vive en el dominio, no en los servicios de aplicación.

## 6.6 Single Source of Truth

El balance del usuario no es un campo almacenado que puede desincronizarse; es siempre calculado a partir de la fuente original: el log de transacciones. Este principio elimina toda una clase de bugs de inconsistencia. El log de transacciones es la fuente de verdad única e inmutable del estado financiero.

## 6.7 Principios de Contabilidad Básica Adaptados

**Partida doble conceptual:** Aunque el sistema no implementa contabilidad de partida doble formal, sí aplica el principio conceptualmente: cada movimiento tiene un origen y un destino. Un egreso hacia una sección de ahorro reduce el balance libre y aumenta el saldo de ahorro; el patrimonio no cambia.

**Conservadurismo:** En caso de duda sobre la clasificación de un movimiento, el sistema favorece la categorización más conservadora (el ingreso incierto no se cuenta hasta confirmarse; el egreso potencial sí se anticipa en las advertencias).

**Consistencia:** Las mismas reglas de clasificación y cálculo se aplican en todos los períodos sin cambios arbitrarios.

---

# 7. REGLAS FINANCIERAS IMPORTANTES

## 7.1 Cálculo del Flujo de Caja

El flujo de caja representa los movimientos reales de dinero en un período.

**Flujo de Caja Operativo del Período:**
```
FCO = Ingresos Ordinarios Confirmados − Egresos Confirmados del Período
```

**Flujo de Caja Total del Período:**
```
FCT = Ingresos Ordinarios + Ingresos Extraordinarios − Egresos
```

**Flujo de Caja Libre (disponible después del ahorro):**
```
FCL = FCO − Aportaciones a Secciones de Ahorro del Período
```

El sistema reporta los tres valores por separado. El FCO muestra la sostenibilidad del estilo de vida sin ingresos extraordinarios. El FCL muestra el dinero realmente disponible para gastar sin comprometer el ahorro.

## 7.2 Cálculo del Patrimonio Neto

```
Patrimonio Neto = Activos Totales − Pasivos Totales
```

Donde:
- **Activos Totales** = Balance disponible en cuenta + Saldos en secciones de ahorro + Otros activos declarados (vehículos, inmuebles, inversiones)
- **Pasivos Totales** = Deudas declaradas (crédito de consumo, hipoteca, préstamo personal)

En la fase inicial, el usuario declara activos y pasivos manualmente. El sistema calcula el patrimonio neto resultante y muestra su evolución en el tiempo.

## 7.3 Manejo de Precisión Decimal

Los cálculos financieros son sensibles a errores de redondeo. El sistema aplica las siguientes reglas:

- **Precisión interna:** Todos los cálculos intermedios se realizan con 8 decimales de precisión.
- **Precisión de almacenamiento:** Los montos se almacenan con 4 decimales de precisión.
- **Precisión de presentación:** Los montos se muestran al usuario con 2 decimales.
- **Estrategia de redondeo:** Se usa el redondeo bancario (ROUND_HALF_EVEN / Round Half to Even) para minimizar el sesgo acumulado en operaciones de gran volumen.
- **Prevención de errores de acumulación:** Los cálculos porcentuales se realizan en una sola operación matemática, no como suma de operaciones parciales. `Base × Porcentaje` es siempre preferible a `suma de (Base/n × Porcentaje)` repetida n veces.

## 7.4 Manejo de Errores Financieros

**Principio de transaccionalidad:** Cualquier operación que involucre múltiples escrituras (registrar movimiento + actualizar saldo de ahorro + generar evento) se ejecuta en una transacción atómica. Si cualquier parte falla, todo se revierte. No existen estados parcialmente aplicados.

**Operaciones idempotentes:** Los casos de uso de escritura son diseñados para ser idempotentes. Si el mismo comando se procesa dos veces (por reintentos en caso de fallo de red), el resultado es el mismo que si se procesara una sola vez. Los movimientos tienen un identificador de idempotencia (idempotency key) que el cliente genera y el servidor verifica antes de procesar.

**Compensación, no eliminación:** Cuando un movimiento ya confirmado resulta ser incorrecto, el sistema no lo elimina ni modifica. Genera un movimiento compensatorio (anulación) que invierte el efecto del movimiento original y registra la razón de la anulación. Ambos movimientos quedan en el historial.

---

# 8. ESCALABILIDAD Y EVOLUCIÓN

## 8.1 Camino Evolutivo del Sistema

La arquitectura modular y la separación de Bounded Contexts garantizan que cada módulo futuro pueda construirse sobre el núcleo existente sin reescribir lo anterior.

### Presupuestos

El módulo de presupuestos introduce el concepto de `Budget`: un límite de gasto por categoría en un período.

**Integración con el dominio existente:**  
- El `Budget` observa los `EgresoRegistrado` events y actualiza el consumo del presupuesto correspondiente.
- No modifica la lógica de registro de egresos existente; se integra mediante el sistema de eventos.
- Agrega un nuevo agregado `BudgetPlan` con su propio ciclo de vida.

### Reportes Financieros Avanzados

Los reportes son operaciones de solo lectura (queries) que agregan datos del log de transacciones. Son candidatos perfectos para una capa de lectura optimizada (CQRS completo):

- Proyecciones de lectura pre-calculadas a partir de eventos de dominio.
- Vistas materializadas por período para consultas rápidas.
- Modelos de reporte independientes del modelo de dominio.

### Proyecciones Financieras

Basadas en el historial de ingresos ordinarios y patrones de gasto, el sistema puede proyectar el flujo de caja futuro. Esto requiere un motor de reglas que analice patrones y extrapole, sin modificar el dominio de datos históricos.

### Integraciones Bancarias

Se integran como adaptadores en la capa de infraestructura que consumen APIs bancarias (Open Banking) y generan movimientos en estado `pendiente` para que el usuario confirme o descarte. El dominio no cambia; solo se agrega un nuevo adaptador.

### Soporte Multi-Moneda

- El objeto de valor `Money` ya incluye `currency` desde el inicio.
- Se agrega el servicio de dominio `CurrencyConverter` que consulta tasas de cambio.
- Las reglas de conversión (en qué momento se convierte, at qué tasa se registra históricamente) se definen como reglas de negocio explícitas.

### Multi-Usuario Familiar

- Se introduce el contexto `FamilyGroup` con una `FamilyFinancialAccount` que agrega múltiples cuentas individuales.
- El modelo de autorización evoluciona a roles (Administrador, Editor, Consultante).
- La privacidad individual se protege mediante zonas de visibilidad configurables: cada miembro puede tener una porción de sus finanzas marcada como privada.

---

# 9. CONSIDERACIONES TÉCNICAS AVANZADAS

## 9.1 Consistencia vs. Disponibilidad

Para una aplicación mono-usuario de finanzas personales, la **consistencia fuerte** es la prioridad absoluta sobre la disponibilidad. Un usuario prefiere ver un error temporal antes que ver un balance incorrecto.

**Implicaciones de diseño:**
- Las transacciones de escritura son síncronas y garantizan consistencia inmediata (ACID).
- No se acepta consistencia eventual para operaciones que afectan balances.
- En caso de fallo del servidor durante una operación, el sistema garantiza atomicidad: la operación completa se ejecuta o no se ejecuta, nunca parcialmente.

## 9.2 Transacciones

Toda operación que modifica el estado financiero se ejecuta dentro de una transacción de base de datos con nivel de aislamiento al menos `READ COMMITTED`. Para operaciones que involucran múltiples registros relacionados (movimiento + sección de ahorro + evento), se usa `SERIALIZABLE` para prevenir lecturas fantasma y condiciones de carrera.

Las transacciones son cortas en duración. No se mantienen transacciones abiertas durante operaciones de red o esperas externas.

## 9.3 Estrategia de Persistencia

**Modelo de datos orientado al log:**  
La tabla de transacciones financieras es de naturaleza append-only. Nada se actualiza ni se elimina en esta tabla. Las anulaciones son nuevas filas. Los estados históricos son derivados de la secuencia de eventos, no de campos actualizados.

**Snapshots de balance:**  
Para optimizar las consultas de balance (evitar sumar toda la historia en cada consulta), el sistema usa snapshots periódicos:
- Al cierre de cada mes, el sistema genera un snapshot del balance acumulado hasta esa fecha.
- Las consultas de balance para períodos posteriores al último snapshot parten del snapshot más reciente, sumando solo las transacciones posteriores.
- Los snapshots son cache de solo lectura; si se detecta inconsistencia, se recalcula desde cero a partir del log.

## 9.4 Auditoría y Trazabilidad

**Log de auditoría financiero:**  
Toda operación de escritura sobre datos financieros genera una entrada inmutable en el log de auditoría que contiene:
- Qué cambió (entidad, campo, valor anterior, valor nuevo).
- Quién lo cambió (userId, sessionId).
- Cuándo (timestamp UTC con precisión de milisegundo).
- Desde dónde (IP, user agent).
- Por qué (causa: operación del usuario, proceso automático, corrección).

Este log es write-only. Ningún proceso del sistema puede modificar ni eliminar entradas del log de auditoría. Su integridad puede verificarse mediante hashes encadenados.

**Trazabilidad de movimientos:**  
Cada movimiento tiene un campo `correlationId` que vincula movimientos relacionados: un movimiento original y su anulación comparten el mismo `correlationId`. Una aportación de ahorro y el registro en la sección de ahorro también tienen el mismo `correlationId`. Esto permite reconstruir la historia completa de cualquier decisión financiera.

## 9.5 Versionado de Reglas de Negocio

Las reglas de negocio evolucionan. El sistema documenta la versión de las reglas que aplicaron a cada movimiento:

- Cada movimiento registra la versión del motor de reglas que lo procesó.
- Al cambiar una regla (por ejemplo, la forma de calcular el monto de ahorro por meta), los movimientos históricos no se recalculan; reflejan la regla vigente cuando ocurrieron.
- Los reportes históricos son reproducibles exactamente con la versión de reglas correspondiente.

## 9.6 Logging Financiero vs. Logging Técnico

**Logging técnico:** Errores de sistema, tiempos de respuesta, excepciones. Es para el equipo de operaciones. No contiene datos financieros de usuarios.

**Logging financiero:** Operaciones de dominio, eventos de negocio, cambios de estado. Es el log de auditoría descrito anteriormente. Contiene datos financieros con protección de privacidad apropiada (datos enmascarados en entornos no productivos).

Nunca se mezclan en el mismo canal de log. El logging financiero tiene retención legal; el logging técnico tiene retención operativa (típicamente 30-90 días).

## 9.7 Concurrencia y Condiciones de Carrera

En un sistema mono-usuario, las condiciones de carrera son poco probables pero posibles (múltiples pestañas del navegador, por ejemplo).

**Estrategia:**  
- Las operaciones de escritura usan bloqueo optimista: cada entidad tiene un campo de versión. Al actualizar, se verifica que la versión en base de datos coincida con la versión leída. Si no coincide, la operación falla y el cliente reintenta.
- El optimistic locking es preferible al pesimista (que bloquea la base de datos) porque los conflictos son raros y el sistema mono-usuario no justifica la penalización de rendimiento del locking pesimista.

---

# GLOSARIO DE TÉRMINOS DEL DOMINIO

| Término | Definición |
|---|---|
| **Ingreso Ordinario** | Entrada de dinero recurrente y predecible del ciclo regular de actividad económica del usuario |
| **Ingreso Extraordinario** | Entrada de dinero no recurrente originada en eventos específicos laborales o financieros |
| **Egreso** | Salida de dinero de la cuenta del usuario, independientemente de su naturaleza |
| **Balance Disponible** | Diferencia entre ingresos y egresos del período activo, excluyendo compromisos de ahorro no ejecutados |
| **Sección de Ahorro** | Espacio separado y nominado donde el usuario acumula recursos con propósito específico |
| **Prima** | Pago semestral adicional al salario, de origen laboral, recibido en junio y diciembre |
| **Cesantías** | Prestación social que acumula el empleador; los intereses se pagan en enero de cada año |
| **Flujo de Caja Ordinario** | Diferencia entre ingresos y egresos del período, sin incluir ingresos extraordinarios |
| **Patrimonio Neto** | Diferencia total entre activos y pasivos declarados por el usuario |
| **Movimiento Compensatorio** | Registro que invierte el efecto de un movimiento incorrecto, sin eliminarlo del historial |
| **Snapshot de Balance** | Fotografía del balance acumulado en un punto del tiempo, usada para optimizar consultas |
| **Período** | Intervalo de tiempo con fecha de inicio y fin, usado para delimitar cálculos financieros |
| **Idempotency Key** | Identificador único por operación que previene el procesamiento duplicado ante reintentos |

---

*Documento generado como especificación de arquitectura y lógica de negocio. No contiene código de implementación. Versión 1.0 — Marzo 2026.*
