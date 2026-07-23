// Reglamento del evento: cada turno SUMA una regla nueva a las anteriores (no las reemplaza),
// igual que en Papers Please. accionSiViola: 'rechazar' (denegar) o 'detener' (caso grave).
window.TURNOS = [
  {
    turno: 1,
    regla: {
      id: 'vigencia',
      tipo: 'documento',
      fuente: 'invitacion',
      // '__HOY__' se reemplaza en app.js por la fecha de hoy (Domains.FECHA_ACTUAL) al armar el
      // reglamento activo -- el jugador ve ambas fechas en la tarjeta y compara el mismo.
      filtro: { type: 'dateRange', field: 'fechaVigencia', min: '__HOY__', max: '9999-12-31' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_vigencia',
    },
  },
  {
    turno: 2,
    regla: {
      id: 'identidad',
      tipo: 'identidad',
      accionSiViola: 'rechazar',
      descripcion: 'regla_identidad',
    },
  },
  {
    turno: 3,
    regla: {
      id: 'edad-minima',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'dateRange', field: 'fechaNacimiento', min: '0000-01-01', max: '2008-12-31' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_edad_minima',
    },
  },
  {
    turno: 4,
    regla: {
      id: 'categoria-valida',
      tipo: 'documento',
      fuente: 'invitacion',
      filtro: { type: 'exact', field: 'categoriaAcceso', value: 'general' },
      esperado: false,
      accionSiViola: 'rechazar',
      descripcion: 'regla_categoria_valida',
    },
  },
  {
    turno: 5,
    regla: {
      id: 'nacionalidad-prohibida',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'exact', field: 'nacionalidad', value: 'chilena' },
      esperado: false,
      accionSiViola: 'detener',
      descripcion: 'regla_nacionalidad_prohibida',
    },
  },
  {
    turno: 6,
    regla: {
      id: 'ciudad-requerida',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'exact', field: 'ciudad', value: 'Buenos Aires' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_ciudad_requerida',
    },
  },
  {
    turno: 7,
    regla: {
      id: 'sin-lentes-sol',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'exact', field: 'lentes', value: 'sunglasses' },
      esperado: false,
      accionSiViola: 'rechazar',
      descripcion: 'regla_sin_lentes_sol',
    },
  },
  {
    turno: 8,
    regla: {
      id: 'edad-maxima',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'dateRange', field: 'fechaNacimiento', min: '1966-01-01', max: '9999-12-31' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_edad_maxima',
    },
  },
  {
    turno: 9,
    regla: {
      id: 'apellido-buscado',
      tipo: 'documento',
      fuente: 'dni',
      filtro: { type: 'exact', field: 'apellido', value: 'Rojas' },
      esperado: false,
      accionSiViola: 'detener',
      descripcion: 'regla_apellido_buscado',
    },
  },
  {
    turno: 10,
    regla: {
      id: 'sin-prensa',
      tipo: 'documento',
      fuente: 'invitacion',
      filtro: { type: 'exact', field: 'categoriaAcceso', value: 'prensa' },
      esperado: false,
      accionSiViola: 'rechazar',
      descripcion: 'regla_sin_prensa',
    },
  },
  {
    turno: 11,
    regla: {
      id: 'sello-valido',
      tipo: 'documento',
      fuente: 'invitacion',
      // El valor exacto debe coincidir con Domains.REFERENCIA_SELLO (mismo dato, no duplicar
      // logica): hoy el sello oficial es "aguila-dorada". El jugador debe comparar este valor
      // contra el sello impreso en la invitacion, no confiar en que el juego se lo diga.
      filtro: { type: 'exact', field: 'codigoSello', value: 'aguila-dorada' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_sello_valido',
    },
  },
  {
    turno: 12,
    regla: {
      id: 'qr-valido',
      tipo: 'documento',
      fuente: 'invitacion',
      // Idem: debe coincidir con Domains.REFERENCIA_QR ("QR-2026-A7X").
      filtro: { type: 'exact', field: 'codigoQR', value: 'QR-2026-A7X' },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'regla_qr_valido',
    },
  },
  {
    turno: 13,
    regla: {
      id: 'codigo-barras',
      tipo: 'codigoBarras',
      accionSiViola: 'rechazar',
      descripcion: 'regla_codigo_barras',
    },
  },
  {
    turno: 14,
    regla: {
      id: 'invitacion-robada',
      tipo: 'documento',
      fuente: 'invitacion',
      // El numero coincide con Domains.REPORTE_ROBO_NUMERO ("37888999", de Valentina Suarez):
      // el jugador debe comparar el codigo de barras impreso contra el numero reportado, no
      // confiar en que el juego se lo diga.
      filtro: { type: 'exact', field: 'codigoBarras', value: '37888999' },
      esperado: false,
      accionSiViola: 'detener',
      descripcion: 'regla_invitacion_robada',
    },
  },
];

window.ATENDEES_POR_TURNO = 8;

// A partir del turno 15 (agotados los 14 turnos fijos de arriba) el reglamento sigue creciendo
// solo: cada turno agrega una regla nueva (elegida al azar de las plantillas de abajo) o
// endurece la regla de vigencia existente. El juego es infinito -- no hay techo de turnos, el
// jugador sobrevive hasta que pierde por errores o por no llegar al requisito de dinero.

function elegir(lista, rng) {
  return lista[Math.floor(rng() * lista.length)];
}

const CAMPOS_PROHIBIBLES = ['nacionalidad', 'genero', 'apellido'];

function plantillaCampoProhibido(turnoIndexSiguiente, rng) {
  const campo = elegir(CAMPOS_PROHIBIBLES, rng);
  const valor = elegir(window.Domains.DOMAINS[campo], rng);
  const accion = rng() < 0.7 ? 'rechazar' : 'detener';
  return {
    id: `gen-${turnoIndexSiguiente}-campo`,
    tipo: 'documento',
    fuente: 'dni',
    filtro: { type: 'exact', field: campo, value: valor },
    esperado: false,
    accionSiViola: accion,
    descripcionGen: { kind: 'campo-prohibido', campo, valor, accion },
  };
}

function plantillaCategoriaProhibida(turnoIndexSiguiente, rng) {
  const valor = elegir(window.Domains.ACCESS_DOMAINS.categoriaAcceso, rng);
  return {
    id: `gen-${turnoIndexSiguiente}-categoria`,
    tipo: 'documento',
    fuente: 'invitacion',
    filtro: { type: 'exact', field: 'categoriaAcceso', value: valor },
    esperado: false,
    accionSiViola: 'rechazar',
    descripcionGen: { kind: 'categoria-prohibida', valor },
  };
}

function plantillaCodigoEspecifico(turnoIndexSiguiente, rng) {
  const esQr = rng() < 0.5;
  const campo = esQr ? 'codigoQR' : 'codigoBarras';
  const valor = esQr ? elegir(window.Domains.CODIGOS_QR, rng) : elegir(window.Domains.NUMEROS_DNI, rng);
  return {
    id: `gen-${turnoIndexSiguiente}-codigo`,
    tipo: 'documento',
    fuente: 'invitacion',
    filtro: { type: 'exact', field: campo, value: valor },
    esperado: true,
    accionSiViola: 'rechazar',
    descripcionGen: { kind: 'codigo-especifico', campo: esQr ? 'qr' : 'barras', valor },
  };
}

function plantillaParidadCodigo(turnoIndexSiguiente, rng) {
  const esPar = rng() < 0.5;
  return {
    id: `gen-${turnoIndexSiguiente}-paridad`,
    tipo: 'documento',
    fuente: 'invitacion',
    filtro: { type: 'paridad', field: 'codigoBarras', esPar },
    esperado: true,
    accionSiViola: 'rechazar',
    descripcionGen: { kind: 'paridad', campo: 'barras', esPar },
  };
}

function elegirDosCampos(rng) {
  const idx1 = Math.floor(rng() * CAMPOS_PROHIBIBLES.length);
  let idx2 = Math.floor(rng() * (CAMPOS_PROHIBIBLES.length - 1));
  if (idx2 >= idx1) idx2 += 1;
  return [CAMPOS_PROHIBIBLES[idx1], CAMPOS_PROHIBIBLES[idx2]];
}

function plantillaCompuesta(turnoIndexSiguiente, rng) {
  const campos = elegirDosCampos(rng);
  const condiciones = campos.map((campo) => ({ campo, valor: elegir(window.Domains.DOMAINS[campo], rng) }));
  const accion = rng() < 0.5 ? 'rechazar' : 'detener';
  return {
    id: `gen-${turnoIndexSiguiente}-compuesta`,
    tipo: 'documento',
    fuente: 'dni',
    filtro: { type: 'todas', filtros: condiciones.map((c) => ({ type: 'exact', field: c.campo, value: c.valor })) },
    esperado: false,
    accionSiViola: accion,
    descripcionGen: { kind: 'compuesta', condiciones, accion },
  };
}

const PLANTILLAS_NUEVA_REGLA = [
  plantillaCampoProhibido, plantillaCategoriaProhibida, plantillaCodigoEspecifico,
  plantillaParidadCodigo, plantillaCompuesta,
];

function reglaVigenciaSinEndurecer(reglasActivas) {
  return reglasActivas.find((r) => r.id === 'vigencia' && !r.vigenciaEndurecida);
}

function generarModificacionVigencia(turnoIndexSiguiente, reglaVigencia, rng) {
  const exacta = rng() < 0.5;
  const filtroNuevo = exacta
    ? { ...reglaVigencia.filtro, max: reglaVigencia.filtro.min }
    : { ...reglaVigencia.filtro, max: sumarDias(reglaVigencia.filtro.min, 10 + Math.floor(rng() * 21)) };
  const dias = exacta ? 0 : Math.round((Date.parse(filtroNuevo.max) - Date.parse(filtroNuevo.min)) / 86400000);
  return {
    accion: 'modificar',
    reglaId: 'vigencia',
    filtroNuevo,
    vigenciaEndurecida: true,
    descripcionGen: exacta ? { kind: 'vigencia-modificada', modo: 'exacta' } : { kind: 'vigencia-modificada', modo: 'ventana', dias },
  };
}

function sumarDias(fechaIso, dias) {
  const ms = Date.parse(fechaIso + 'T00:00:00Z') + dias * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

// turnoIndexSiguiente: indice 0-based del turno que esta por empezar (>=14, ya agotados los fijos).
function generarSiguienteTurno(turnoIndexSiguiente, reglasActivas, rng) {
  const vigenciaModificable = reglaVigenciaSinEndurecer(reglasActivas);
  if (vigenciaModificable && rng() < 0.25) {
    return generarModificacionVigencia(turnoIndexSiguiente, vigenciaModificable, rng);
  }
  const plantilla = elegir(PLANTILLAS_NUEVA_REGLA, rng);
  return { accion: 'agregar', regla: plantilla(turnoIndexSiguiente, rng) };
}

window.generarSiguienteTurno = generarSiguienteTurno;
