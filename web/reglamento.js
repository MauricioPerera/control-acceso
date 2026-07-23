// Reglamento del evento: cada turno SUMA una regla nueva a las anteriores (no las reemplaza),
// igual que en Papers Please. accionSiViola: 'rechazar' (denegar) o 'detener' (caso grave).
window.TURNOS = [
  {
    turno: 1,
    regla: {
      id: 'vigencia',
      tipo: 'documento',
      fuente: 'invitacion',
      filtro: { type: 'exact', field: 'vigente', value: true },
      esperado: true,
      accionSiViola: 'rechazar',
      descripcion: 'La invitacion debe estar vigente.',
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
];

window.ATENDEES_POR_TURNO = 8;
