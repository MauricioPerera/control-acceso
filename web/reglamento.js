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
      descripcion: 'La fecha de vigencia de la invitacion debe ser igual o posterior a hoy.',
    },
  },
  {
    turno: 2,
    regla: {
      id: 'identidad',
      tipo: 'identidad',
      accionSiViola: 'rechazar',
      descripcion: 'El nombre y apellido de la invitacion deben coincidir con el DNI.',
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
      descripcion: 'Solo se permite el ingreso a mayores de 18 anios.',
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
      descripcion: 'Hoy NO se acepta categoria "general" (evento solo VIP/staff/prensa).',
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
      descripcion: 'ALERTA: detener a cualquier persona de nacionalidad chilena (orden vigente).',
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
      descripcion: 'Hoy el ingreso es exclusivo para residentes de Buenos Aires.',
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
      descripcion: 'No se permite el ingreso con el rostro cubierto por lentes de sol.',
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
      descripcion: 'El evento de hoy es solo para personas de hasta 60 anios.',
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
      descripcion: 'ALERTA: detener a cualquier persona de apellido Rojas (orden judicial).',
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
      descripcion: 'Hoy tampoco se acepta categoria "prensa" (evento privado, sin medios).',
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
      descripcion: 'El sello oficial vigente hoy es "aguila-dorada". La invitacion debe llevar ese sello.',
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
      descripcion: 'El codigo QR oficial vigente hoy es "QR-2026-A7X". La invitacion debe llevar ese codigo.',
    },
  },
  {
    turno: 13,
    regla: {
      id: 'codigo-barras',
      tipo: 'codigoBarras',
      accionSiViola: 'rechazar',
      descripcion: 'El codigo de barras de la invitacion debe coincidir con el numero de DNI.',
    },
  },
];

window.ATENDEES_POR_TURNO = 8;
