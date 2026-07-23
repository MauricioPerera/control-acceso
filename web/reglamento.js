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
];

window.ATENDEES_POR_TURNO = 8;
