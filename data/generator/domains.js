// Dominios de atributos. Los valores visuales (accessories/facialHair/skinColor/hairColor/top)
// son los enums reales de @dicebear/collection@9 avataaars (confirmados vía su schema en runtime).
// "none" es un valor propio nuestro (no existe en dicebear): se traduce a probability=0 en
// assignAvatarParams.

const IDENTITY_DOMAINS = {
  genero: ['femenino', 'masculino', 'no-binario'],
  nacionalidad: [
    'argentina', 'uruguaya', 'chilena', 'brasileña', 'peruana', 'colombiana',
    'mexicana', 'española', 'alemana', 'francesa', 'italiana', 'portuguesa',
    'estadounidense', 'canadiense', 'japonesa', 'coreana', 'china', 'india',
  ],
  ciudad: [
    'Buenos Aires', 'Montevideo', 'Santiago', 'São Paulo', 'Lima', 'Bogotá',
    'Ciudad de México', 'Madrid', 'Berlín', 'París', 'Roma', 'Lisboa',
    'Nueva York', 'Toronto', 'Tokio', 'Seúl', 'Shanghái', 'Bombay',
  ],
};

const VISUAL_DOMAINS = {
  lentes: [
    'none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses',
    'wayfarers', 'eyepatch',
  ],
  velloFacial: [
    'none', 'beardLight', 'beardMajestic', 'beardMedium', 'moustacheFancy',
    'moustacheMagnum',
  ],
  tonoPiel: ['614335', 'd08b5b', 'ae5d29', 'edb98a', 'ffdbb4', 'fd9841', 'f8d25c'],
  colorPelo: [
    'a55728', '2c1b18', 'b58143', 'd6b370', '724133', '4a312c', 'f59797',
    'ecdcbf', 'c93305', 'e8e1e1',
  ],
  peinado: [
    'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand',
    'longButNotTooLong', 'miaWallace', 'shavedSides', 'straight02', 'straight01',
    'straightAndStrand', 'dreads01', 'dreads02', 'frizzle', 'shaggy',
    'shaggyMullet', 'shortCurly', 'shortFlat', 'shortRound', 'shortWaved',
    'sides', 'theCaesar', 'theCaesarAndSidePart', 'bigHair',
  ],
};

// Nombres/apellidos son dominios abiertos (no un enum cerrado): listas de muestra amplias para
// que mutateProfile pueda tratarlos igual que cualquier otro atributo mutable.
const NOMBRES = [
  'Sofía', 'Mateo', 'Valentina', 'Lucas', 'Isabella', 'Santiago', 'Camila', 'Benjamín',
  'Emma', 'Joaquín', 'Martina', 'Diego', 'Renata', 'Nicolás', 'Julieta', 'Tomás',
  'Victoria', 'Emiliano', 'Antonella', 'Gabriel', 'Catalina', 'Sebastián', 'Florencia', 'Iván',
];

const APELLIDOS = [
  'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Sánchez',
  'Romero', 'Díaz', 'Torres', 'Flores', 'Acosta', 'Silva', 'Rojas', 'Molina',
  'Ortiz', 'Suárez', 'Castro', 'Vargas', 'Ramírez', 'Herrera', 'Medina', 'Aguirre', 'Núñez',
];

// Dominio discreto de fechas de nacimiento: un valor por dia entre 1960-01-01 y 2015-12-31.
// El limite superior llega hasta 2015 (a diferencia de Detective 40k) para que existan
// asistentes menores de edad -- necesario para que la regla "edad minima" tenga sentido.
function buildBirthDateDomain() {
  const dates = [];
  const start = Date.UTC(1960, 0, 1);
  const end = Date.UTC(2015, 11, 31);
  const dayMs = 24 * 60 * 60 * 1000;
  for (let t = start; t <= end; t += dayMs) {
    dates.push(new Date(t).toISOString().slice(0, 10));
  }
  return dates;
}

const FECHAS_NACIMIENTO = buildBirthDateDomain();

// Fecha de "hoy" del juego: la fecha real del dispositivo, mostrada en la UI para que el jugador
// compare contra la fecha de vigencia de cada invitacion (en vez de que el juego le diga si
// "vigente" es true/false). No es parte de ninguna funcion con contrato CCDD -- domains.js es
// contenido, no logica gateada.
function computeFechaActual() {
  return new Date().toISOString().slice(0, 10);
}

const FECHA_ACTUAL = computeFechaActual();

// Ventana de fechas de vigencia de invitaciones: +/-45 dias alrededor de hoy, para que
// aproximadamente la mitad esten vencidas y la mitad vigentes.
function buildVigenciaDomain(fechaActual) {
  const dates = [];
  const centerMs = Date.parse(fechaActual + 'T00:00:00Z');
  const dayMs = 24 * 60 * 60 * 1000;
  for (let offset = -45; offset <= 45; offset++) {
    dates.push(new Date(centerMs + offset * dayMs).toISOString().slice(0, 10));
  }
  return dates;
}

const FECHAS_VIGENCIA = buildVigenciaDomain(FECHA_ACTUAL);

// Numeros de DNI de muestra (dominio abierto, igual que nombre/apellido): el codigo de barras de
// la invitacion deberia coincidir con uno de estos, tomado del propio DNI del asistente.
const NUMEROS_DNI = [
  '30111222', '31222333', '32333444', '33444555', '34555666', '35666777',
  '36777888', '37888999', '38999000', '39000111', '40111222', '41222333',
  '42333444', '43444555', '44555666', '45666777', '46777888', '47888999',
];

// Dominios propios de este juego (control de acceso): categoria del ticket, fecha de vigencia de
// la invitacion, y numero de DNI (para el chequeo cruzado del codigo de barras).
const ACCESS_DOMAINS = {
  categoriaAcceso: ['general', 'vip', 'staff', 'prensa'],
  fechaVigencia: FECHAS_VIGENCIA,
  numeroDni: NUMEROS_DNI,
};

const DOMAINS = {
  ...IDENTITY_DOMAINS,
  ...VISUAL_DOMAINS,
  ...ACCESS_DOMAINS,
  nombre: NOMBRES,
  apellido: APELLIDOS,
  fechaNacimiento: FECHAS_NACIMIENTO,
};

if (typeof module !== 'undefined') {
  module.exports = {
    IDENTITY_DOMAINS, VISUAL_DOMAINS, ACCESS_DOMAINS, DOMAINS, NOMBRES, APELLIDOS,
    FECHAS_NACIMIENTO, FECHA_ACTUAL, FECHAS_VIGENCIA, NUMEROS_DNI,
  };
}
if (typeof window !== 'undefined') {
  window.Domains = {
    IDENTITY_DOMAINS, VISUAL_DOMAINS, ACCESS_DOMAINS, DOMAINS, NOMBRES, APELLIDOS,
    FECHAS_NACIMIENTO, FECHA_ACTUAL, FECHAS_VIGENCIA, NUMEROS_DNI,
  };
}
