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

// Dominios propios de este juego (control de acceso): categoria del ticket y si la invitacion
// (no el DNI) esta vigente.
const ACCESS_DOMAINS = {
  categoriaAcceso: ['general', 'vip', 'staff', 'prensa'],
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
    IDENTITY_DOMAINS, VISUAL_DOMAINS, ACCESS_DOMAINS, DOMAINS, NOMBRES, APELLIDOS, FECHAS_NACIMIENTO,
  };
}
if (typeof window !== 'undefined') {
  window.Domains = { IDENTITY_DOMAINS, VISUAL_DOMAINS, ACCESS_DOMAINS, DOMAINS, NOMBRES, APELLIDOS, FECHAS_NACIMIENTO };
}
