(function () {
  const SWIPE_THRESHOLD = 100;
  const DNI_KEYS = [
    'nombre', 'apellido', 'fechaNacimiento', 'genero', 'nacionalidad', 'ciudad',
    'lentes', 'velloFacial', 'tonoPiel', 'colorPelo', 'peinado', 'numeroDni',
  ];
  const MATCH_PROBABILITY = 0.7;
  const REFERENCIAS_SEGURIDAD = { sello: Domains.REFERENCIA_SELLO, qr: Domains.REFERENCIA_QR };
  const PAGO_POR_CORRECTA = 5;
  const BONUS_DETENCION = 10;
  const LIMITE_ERRORES = 3;
  const TIEMPO_POR_TURNO = 60;

  const UPGRADES = [
    { id: 'mas-tiempo', nombre: 'upgrade_mas_tiempo_nombre', costo: 15, descripcion: 'upgrade_mas_tiempo_desc', aplicar: (s) => { s.timeBonus += 15; } },
    { id: 'mano-dura', nombre: 'upgrade_mano_dura_nombre', costo: 20, descripcion: 'upgrade_mano_dura_desc', aplicar: (s) => { s.erroresBonus += 1; } },
    { id: 'contactos', nombre: 'upgrade_contactos_nombre', costo: 15, descripcion: 'upgrade_contactos_desc', aplicar: (s) => { s.requisitoDescuento += 5; } },
  ];

  const CONSUMIBLES = [
    { id: 'cafe', nombre: 'consumible_cafe_nombre', costo: 8, descripcion: 'consumible_cafe_desc', aplicar: (s) => { s.tiempoExtraTemporal += 10; } },
    { id: 'comodin', nombre: 'consumible_comodin_nombre', costo: 12, descripcion: 'consumible_comodin_desc', aplicar: (s) => { s.indulgencias += 1; } },
    { id: 'contacto-rapido', nombre: 'consumible_contacto_rapido_nombre', costo: 10, descripcion: 'consumible_contacto_rapido_desc', aplicar: (s) => { s.requisitoDescuentoTemporal += 5; } },
  ];

  const EVENTOS = [
    { texto: 'evento1_texto', resultado: 'evento1_resultado', efecto: (s) => { s.ahorros += 10; } },
    { texto: 'evento2_texto', resultado: 'evento2_resultado', efecto: (s) => { s.ahorros = Math.max(0, s.ahorros - 5); } },
    { texto: 'evento3_texto', resultado: 'evento3_resultado', efecto: () => {} },
  ];

  function requisitoParaTurno(turnoIndex) {
    return Math.max(0, 10 + turnoIndex * 2 - state.requisitoDescuento - state.requisitoDescuentoTemporal);
  }

  const state = {
    rng: null,
    idCounter: 0,
    turnoIndex: 0,
    reglasActivas: [],
    attendeeIndexInTurno: 0,
    correct: 0,
    incorrect: 0,
    dinero: 0,
    errores: 0,
    ahorros: 0,
    comprados: new Set(),
    timeBonus: 0,
    erroresBonus: 0,
    requisitoDescuento: 0,
    tiempoExtraTemporal: 0,
    requisitoDescuentoTemporal: 0,
    indulgencias: 0,
    tiempoRestante: TIEMPO_POR_TURNO,
    turnoTiempoTotal: TIEMPO_POR_TURNO,
    timerHandle: null,
    celebrados: new Set(),
    current: null,
    createAvatar: null,
    avataaars: null,
    gameOver: false,
    drag: { active: false, startX: 0, startY: 0, deltaX: 0, deltaY: 0 },
  };

  const card = document.getElementById('attendee-card');
  const stamp = document.getElementById('swipe-stamp');

  function generateAttendee() {
    const templateBase = {};
    for (const key of DNI_KEYS) templateBase[key] = null;
    const dni = Engine.mutateProfile(templateBase, 1, Domains.DOMAINS, state.rng);
    dni.id = `char-${state.idCounter++}`;
    const identidad = Engine.generateInvitacionIdentidad(dni, MATCH_PROBABILITY, Domains.DOMAINS, state.rng);
    const estado = Engine.generateInvitacionEstado(Domains.DOMAINS, state.rng);
    const seguridad = Engine.generateInvitacionSeguridad(REFERENCIAS_SEGURIDAD, MATCH_PROBABILITY, Domains.DOMAINS, state.rng);
    const invitacion = { ...identidad, ...estado, ...seguridad };
    const avatarParams = Engine.assignAvatarParams(dni);
    return { dni, invitacion, avatarParams };
  }

  function resolveHoyPlaceholder(regla) {
    if (!regla.filtro) return regla;
    const filtro = { ...regla.filtro };
    if (filtro.min === '__HOY__') filtro.min = Domains.FECHA_ACTUAL;
    if (filtro.max === '__HOY__') filtro.max = Domains.FECHA_ACTUAL;
    return { ...regla, filtro };
  }

  function avatarSvgFor(attendee) {
    const avatar = state.createAvatar(state.avataaars, { ...attendee.avatarParams, size: 96 });
    return avatar.toString();
  }

  function renderDescripcionGen(gen) {
    switch (gen.kind) {
      case 'campo-prohibido':
        return I18N.t('gen_campo_prohibido', { accion: accionTexto(gen.accion), campo: I18N.t(`campo_${gen.campo}`), valor: gen.valor });
      case 'categoria-prohibida':
        return I18N.t('gen_categoria_prohibida', { valor: gen.valor });
      case 'codigo-especifico':
        return I18N.t('gen_codigo_especifico', { campo: I18N.t(`campo_${gen.campo}`), valor: gen.valor });
      case 'paridad':
        return I18N.t(gen.esPar ? 'gen_paridad_par' : 'gen_paridad_impar', { campo: I18N.t(`campo_${gen.campo}`) });
      case 'compuesta': {
        const conj = I18N.t('conjuncion_y');
        const condiciones = gen.condiciones.map((c) => `${I18N.t(`campo_${c.campo}`)} "${c.valor}"`).join(` ${conj} `);
        return I18N.t('gen_compuesta', { accion: accionTexto(gen.accion), condiciones });
      }
      case 'vigencia-modificada':
        return gen.modo === 'exacta' ? I18N.t('gen_vigencia_exacta') : I18N.t('gen_vigencia_ventana', { dias: gen.dias });
      default:
        return '';
    }
  }

  function textoRegla(regla) {
    if (regla.descripcionGen) return renderDescripcionGen(regla.descripcionGen);
    return I18N.t(regla.descripcion);
  }

  function renderReglasList(ulId) {
    const list = document.getElementById(ulId);
    list.innerHTML = '';
    for (const regla of state.reglasActivas) {
      const li = document.createElement('li');
      li.textContent = textoRegla(regla);
      list.appendChild(li);
    }
  }

  function renderReglamento() {
    renderReglasList('reglamento-list');
  }

  function showDiaModal() {
    document.getElementById('dia-turno-num').textContent = String(state.turnoIndex + 1);
    document.getElementById('dia-requisito').textContent = String(requisitoParaTurno(state.turnoIndex));
    renderReglasList('dia-reglas-list');
    document.getElementById('dia-modal').classList.remove('hidden');
  }

  function onIniciarJornada() {
    document.getElementById('dia-modal').classList.add('hidden');
    state.current = generateAttendee();
    renderCard();
    startTimer();
  }

  function renderCard() {
    const a = state.current;
    document.getElementById('avatar-container').innerHTML = avatarSvgFor(a);
    document.getElementById('dni-numero').textContent = a.dni.numeroDni;
    document.getElementById('dni-nombre').textContent = a.dni.nombre;
    document.getElementById('dni-apellido').textContent = a.dni.apellido;
    document.getElementById('dni-fecha').textContent = a.dni.fechaNacimiento;
    document.getElementById('dni-genero').textContent = a.dni.genero;
    document.getElementById('dni-nacionalidad').textContent = a.dni.nacionalidad;
    document.getElementById('dni-ciudad').textContent = a.dni.ciudad;
    document.getElementById('inv-nombre').textContent = a.invitacion.nombre;
    document.getElementById('inv-apellido').textContent = a.invitacion.apellido;
    document.getElementById('inv-categoria').textContent = a.invitacion.categoriaAcceso;
    document.getElementById('inv-fecha-vigencia').textContent = a.invitacion.fechaVigencia;
    document.getElementById('inv-codigo-barras').textContent = a.invitacion.codigoBarras;
    document.getElementById('inv-sello').textContent = a.invitacion.codigoSello;
    document.getElementById('inv-qr').textContent = a.invitacion.codigoQR;
    card.style.transform = '';
    stamp.className = 'hidden';
  }

  function updateScoreDisplay() {
    document.getElementById('turno-value').textContent = String(state.turnoIndex + 1);
    document.getElementById('dinero-value').textContent = String(state.dinero);
    document.getElementById('requisito-value').textContent = String(requisitoParaTurno(state.turnoIndex));
    document.getElementById('errores-value').textContent = String(state.errores);
    document.getElementById('limite-errores-value').textContent = String(LIMITE_ERRORES + state.erroresBonus);
    document.getElementById('ahorros-value').textContent = String(state.ahorros);
  }

  function updateTimerDisplay() {
    const segundos = Math.max(state.tiempoRestante, 0);
    const pct = Math.max(0, Math.min(100, (segundos / state.turnoTiempoTotal) * 100));
    const fill = document.getElementById('timer-bar-fill');
    fill.style.width = `${pct}%`;
    fill.style.background = pct > 50 ? '#3b6' : pct > 20 ? '#e93' : '#e33';
  }

  function violatedReglas(reglas, attendee) {
    return reglas.filter((r) => !Engine.evaluateRule(r, attendee));
  }

  function triggerConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    const colors = ['#e33', '#3b6', '#6cf', '#fc3', '#c6f'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.3}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1600);
  }

  function startTimerInterval() {
    state.timerHandle = setInterval(() => {
      state.tiempoRestante -= 1;
      updateTimerDisplay();
      if (state.tiempoRestante <= 0) {
        stopTimer();
        endTurno();
      }
    }, 1000);
  }

  function startTimer() {
    state.turnoTiempoTotal = TIEMPO_POR_TURNO + state.timeBonus + state.tiempoExtraTemporal;
    state.tiempoExtraTemporal = 0;
    state.tiempoRestante = state.turnoTiempoTotal;
    updateTimerDisplay();
    startTimerInterval();
  }

  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function resumeTimer() {
    if (!state.gameOver && !state.timerHandle) startTimerInterval();
  }

  function accionTexto(accion) {
    return I18N.t(`accion_${accion}`);
  }

  function showFeedback(wasCorrect, correctAction, chosenAction, violadas, indultado, bonoDetencion) {
    document.getElementById('feedback-title').textContent =
      I18N.t(wasCorrect ? 'feedback_correcto_titulo' : 'feedback_incorrecto_titulo');
    let body;
    if (wasCorrect) {
      body = I18N.t('feedback_bien', { accion: accionTexto(chosenAction) });
      if (bonoDetencion > 0) body += I18N.t('feedback_bonus_detencion', { bonus: bonoDetencion });
    } else if (violadas.length > 0) {
      const motivos = violadas.map((r) => textoRegla(r)).join(' ');
      body = I18N.t('feedback_mal_con_motivo', {
        elegido: accionTexto(chosenAction), correcto: accionTexto(correctAction), motivos,
      });
    } else {
      body = I18N.t('feedback_mal_sin_motivo', { elegido: accionTexto(chosenAction), correcto: accionTexto(correctAction) });
    }
    if (indultado) body += I18N.t('feedback_indultado');
    document.getElementById('feedback-body').textContent = body;
    document.getElementById('feedback-modal').classList.remove('hidden');
  }

  function decide(chosenAction) {
    if (state.gameOver || !state.current) return;
    const violadas = violatedReglas(state.reglasActivas, state.current);
    const correctAction = Engine.determineCorrectAction(state.reglasActivas, state.current);
    const wasCorrect = chosenAction === correctAction;
    let indultado = false;
    let bonoDetencion = 0;
    if (wasCorrect) {
      state.correct += 1;
      state.dinero += PAGO_POR_CORRECTA;
      if (chosenAction === 'detener') {
        bonoDetencion = BONUS_DETENCION;
        state.dinero += bonoDetencion;
      }
      const nuevas = violadas.filter((r) => !state.celebrados.has(r.id));
      if (nuevas.length > 0) {
        nuevas.forEach((r) => state.celebrados.add(r.id));
        triggerConfetti();
      }
    } else {
      state.incorrect += 1;
      if (state.indulgencias > 0) {
        state.indulgencias -= 1;
        indultado = true;
      } else {
        state.errores += 1;
      }
    }
    updateScoreDisplay();
    showFeedback(wasCorrect, correctAction, chosenAction, violadas, indultado, bonoDetencion);
  }

  function advance() {
    state.attendeeIndexInTurno += 1;
    if (state.attendeeIndexInTurno >= window.ATENDEES_POR_TURNO) {
      endTurno();
      return;
    }
    state.current = generateAttendee();
    renderCard();
  }

  function obtenerSiguienteTurnoInfo() {
    const fija = window.TURNOS[state.turnoIndex + 1];
    if (fija) return { tipo: 'fija', regla: resolveHoyPlaceholder(fija.regla) };
    return window.generarSiguienteTurno(state.turnoIndex + 1, state.reglasActivas, state.rng);
  }

  function textoSiguienteTurno(info) {
    if (info.tipo === 'fija') return textoRegla(info.regla);
    if (info.accion === 'agregar') return textoRegla(info.regla);
    return renderDescripcionGen(info.descripcionGen);
  }

  function endTurno() {
    stopTimer();
    const requisito = requisitoParaTurno(state.turnoIndex);
    state.requisitoDescuentoTemporal = 0;
    state.indulgencias = 0;
    if (state.dinero < requisito) {
      endGame('dinero', requisito);
      return;
    }
    state.ahorros += state.dinero - requisito;
    state.proximoTurnoInfo = obtenerSiguienteTurnoInfo();
    document.getElementById('end-title').textContent = I18N.t('turno_completo_titulo');
    document.getElementById('end-close').textContent = I18N.t('btn_continuar');
    document.getElementById('end-body').textContent = I18N.t('turno_completo_cuerpo', {
      turno: state.turnoIndex + 1,
      ganado: state.dinero,
      requisito,
      ahorros: state.ahorros,
      regla: textoSiguienteTurno(state.proximoTurnoInfo),
    });
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function endGame(reason, extra) {
    state.gameOver = true;
    stopTimer();
    const mensajes = {
      errores: I18N.t('fin_errores', { limite: LIMITE_ERRORES + state.erroresBonus }),
      dinero: I18N.t('fin_dinero', { requisito: extra, ganado: state.dinero }),
    };
    document.getElementById('end-title').textContent = I18N.t('fin_partida_titulo');
    document.getElementById('end-close').textContent = I18N.t('btn_reiniciar');
    document.getElementById('end-body').textContent = mensajes[reason];
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function aplicarSiguienteTurno(info) {
    if (info.tipo === 'fija') {
      state.reglasActivas.push(info.regla);
      return;
    }
    if (info.accion === 'agregar') {
      state.reglasActivas.push(info.regla);
      return;
    }
    const idx = state.reglasActivas.findIndex((r) => r.id === info.reglaId);
    if (idx === -1) return;
    state.reglasActivas[idx] = {
      ...state.reglasActivas[idx],
      filtro: info.filtroNuevo,
      vigenciaEndurecida: info.vigenciaEndurecida,
      descripcionGen: info.descripcionGen,
    };
  }

  function onEndModalClose() {
    document.getElementById('end-modal').classList.add('hidden');
    if (state.gameOver) {
      location.reload();
      return;
    }
    state.turnoIndex += 1;
    aplicarSiguienteTurno(state.proximoTurnoInfo);
    state.attendeeIndexInTurno = 0;
    state.dinero = 0;
    renderReglamento();
    updateScoreDisplay();
    showEntreDias();
  }

  function showEntreDias() {
    if (state.rng() < 0.4) {
      showEvento();
    } else {
      showTienda();
    }
  }

  function renderTiendaSeccion(ulId, items, esPermanente) {
    const list = document.getElementById(ulId);
    list.innerHTML = '';
    if (esPermanente && items.length === 0) {
      const li = document.createElement('li');
      li.textContent = I18N.t('ya_compraste_todo');
      list.appendChild(li);
      return;
    }
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = `${I18N.t(item.nombre)}: ${I18N.t(item.descripcion)} `;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = `${I18N.t('comprar')} $${item.costo}`;
      btn.disabled = state.ahorros < item.costo;
      btn.addEventListener('click', () => comprarItem(item, esPermanente));
      li.appendChild(btn);
      list.appendChild(li);
    }
  }

  function showTienda() {
    renderTiendaSeccion('tienda-permanentes-list', UPGRADES.filter((u) => !state.comprados.has(u.id)), true);
    renderTiendaSeccion('tienda-consumibles-list', CONSUMIBLES, false);
    document.getElementById('tienda-ahorros').textContent = String(state.ahorros);
    document.getElementById('tienda-modal').classList.remove('hidden');
  }

  function comprarItem(item, esPermanente) {
    if (state.ahorros < item.costo) return;
    if (esPermanente && state.comprados.has(item.id)) return;
    state.ahorros -= item.costo;
    if (esPermanente) state.comprados.add(item.id);
    item.aplicar(state);
    updateScoreDisplay();
    showTienda();
  }

  function showEvento() {
    const evento = EVENTOS[Math.floor(state.rng() * EVENTOS.length)];
    evento.efecto(state);
    document.getElementById('evento-texto').textContent = I18N.t(evento.texto);
    document.getElementById('evento-resultado').textContent =
      I18N.t(evento.resultado) + I18N.t('evento_ahorros_suffix', { ahorros: state.ahorros });
    updateScoreDisplay();
    document.getElementById('evento-modal').classList.remove('hidden');
  }

  function wireDrag() {
    card.addEventListener('pointerdown', (e) => {
      state.drag.active = true;
      state.drag.startX = e.clientX;
      state.drag.startY = e.clientY;
      card.classList.add('dragging');
      card.classList.remove('snap-back');
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', (e) => {
      if (!state.drag.active) return;
      const deltaX = e.clientX - state.drag.startX;
      const deltaY = e.clientY - state.drag.startY;
      state.drag.deltaX = deltaX;
      state.drag.deltaY = deltaY;
      card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX / 20}deg)`;
      if (deltaX > 20) {
        stamp.className = 'aprobar';
      } else if (deltaX < -20) {
        stamp.className = 'rechazar';
      } else {
        stamp.className = 'hidden';
      }
    });
    card.addEventListener('pointerup', () => {
      if (!state.drag.active) return;
      state.drag.active = false;
      card.classList.remove('dragging');
      const result = Engine.interpretSwipe(state.drag.deltaX, state.drag.deltaY, SWIPE_THRESHOLD);
      if (result) {
        decide(result);
      } else {
        card.classList.add('snap-back');
        card.style.transform = '';
        stamp.className = 'hidden';
      }
    });
    document.getElementById('btn-aprobar').addEventListener('click', () => decide('aprobar'));
    document.getElementById('btn-rechazar').addEventListener('click', () => decide('rechazar'));
    document.getElementById('btn-detener').addEventListener('click', () => decide('detener'));
    document.getElementById('feedback-close').addEventListener('click', () => {
      document.getElementById('feedback-modal').classList.add('hidden');
      if (state.errores >= LIMITE_ERRORES + state.erroresBonus) {
        endGame('errores');
      } else {
        advance();
      }
    });
    document.getElementById('end-close').addEventListener('click', onEndModalClose);
    document.getElementById('dia-iniciar').addEventListener('click', onIniciarJornada);
    document.getElementById('btn-como-jugar').addEventListener('click', () => {
      stopTimer();
      document.getElementById('como-jugar-modal').classList.remove('hidden');
    });
    document.getElementById('como-jugar-close').addEventListener('click', () => {
      document.getElementById('como-jugar-modal').classList.add('hidden');
      resumeTimer();
    });
    document.getElementById('btn-reglamento').addEventListener('click', () => {
      stopTimer();
      document.getElementById('reglamento-modal').classList.remove('hidden');
    });
    document.getElementById('reglamento-close').addEventListener('click', () => {
      document.getElementById('reglamento-modal').classList.add('hidden');
      resumeTimer();
    });
    document.getElementById('tienda-continuar').addEventListener('click', () => {
      document.getElementById('tienda-modal').classList.add('hidden');
      showDiaModal();
    });
    document.getElementById('evento-continuar').addEventListener('click', () => {
      document.getElementById('evento-modal').classList.add('hidden');
      showTienda();
    });
    document.querySelectorAll('[data-idioma]').forEach((btn) => {
      btn.addEventListener('click', () => I18N.setIdioma(btn.getAttribute('data-idioma')));
    });
    document.getElementById('bienvenida-continuar').addEventListener('click', () => {
      document.getElementById('bienvenida-modal').classList.add('hidden');
      showDiaModal();
    });
  }

  function refrescarTextosDinamicos() {
    renderReglamento();
    if (!document.getElementById('dia-modal').classList.contains('hidden')) showDiaModal();
    if (!document.getElementById('tienda-modal').classList.contains('hidden')) showTienda();
  }

  async function init() {
    state.rng = Engine.createSeededRng((Date.now() >>> 0));
    state.reglasActivas = [resolveHoyPlaceholder(window.TURNOS[0].regla)];
    document.getElementById('fecha-actual').textContent = Domains.FECHA_ACTUAL;

    const { createAvatar } = await import('https://esm.sh/@dicebear/core@9');
    const { avataaars } = await import('https://esm.sh/@dicebear/collection@9');
    state.createAvatar = createAvatar;
    state.avataaars = avataaars;

    I18N.onChange = refrescarTextosDinamicos;
    I18N.aplicarTraducciones();
    renderReglamento();
    updateScoreDisplay();
    wireDrag();
    document.getElementById('bienvenida-modal').classList.remove('hidden');
  }

  init();
})();
