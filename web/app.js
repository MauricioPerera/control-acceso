(function () {
  const SWIPE_THRESHOLD = 100;
  const DNI_KEYS = [
    'nombre', 'apellido', 'fechaNacimiento', 'genero', 'nacionalidad', 'ciudad',
    'lentes', 'velloFacial', 'tonoPiel', 'colorPelo', 'peinado', 'numeroDni',
  ];
  const MATCH_PROBABILITY = 0.7;
  const REFERENCIAS_SEGURIDAD = { sello: Domains.REFERENCIA_SELLO, qr: Domains.REFERENCIA_QR };
  const PAGO_POR_CORRECTA = 5;
  const LIMITE_ERRORES = 3;
  const TIEMPO_POR_TURNO = 60;

  function requisitoParaTurno(turnoIndex) {
    return 10 + turnoIndex * 2;
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
    tiempoRestante: TIEMPO_POR_TURNO,
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

  function renderReglasList(ulId) {
    const list = document.getElementById(ulId);
    list.innerHTML = '';
    for (const regla of state.reglasActivas) {
      const li = document.createElement('li');
      li.textContent = regla.descripcion;
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
  }

  function updateTimerDisplay() {
    const segundos = Math.max(state.tiempoRestante, 0);
    const pct = Math.max(0, Math.min(100, (segundos / TIEMPO_POR_TURNO) * 100));
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
    state.tiempoRestante = TIEMPO_POR_TURNO;
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

  function showFeedback(wasCorrect, correctAction, chosenAction, violadas) {
    document.getElementById('feedback-title').textContent = wasCorrect ? 'Correcto' : 'Incorrecto';
    let body;
    if (wasCorrect) {
      body = `Hiciste bien en ${chosenAction}.`;
    } else if (violadas.length > 0) {
      const motivos = violadas.map((r) => r.descripcion).join(' ');
      body = `Elegiste ${chosenAction}, pero lo correcto era ${correctAction}. Lo que estaba mal: ${motivos}`;
    } else {
      body = `Elegiste ${chosenAction}, pero lo correcto era ${correctAction}: no habia ningun problema con esta invitacion.`;
    }
    document.getElementById('feedback-body').textContent = body;
    document.getElementById('feedback-modal').classList.remove('hidden');
  }

  function decide(chosenAction) {
    if (state.gameOver || !state.current) return;
    const violadas = violatedReglas(state.reglasActivas, state.current);
    const correctAction = Engine.determineCorrectAction(state.reglasActivas, state.current);
    const wasCorrect = chosenAction === correctAction;
    if (wasCorrect) {
      state.correct += 1;
      state.dinero += PAGO_POR_CORRECTA;
      const nuevas = violadas.filter((r) => !state.celebrados.has(r.id));
      if (nuevas.length > 0) {
        nuevas.forEach((r) => state.celebrados.add(r.id));
        triggerConfetti();
      }
    } else {
      state.incorrect += 1;
      state.errores += 1;
    }
    updateScoreDisplay();
    showFeedback(wasCorrect, correctAction, chosenAction, violadas);
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

  function endTurno() {
    stopTimer();
    const requisito = requisitoParaTurno(state.turnoIndex);
    if (state.dinero < requisito) {
      endGame('dinero', requisito);
      return;
    }
    const nextTurnoData = window.TURNOS[state.turnoIndex + 1];
    if (!nextTurnoData) {
      endGame('victoria');
      return;
    }
    document.getElementById('end-title').textContent = 'Fin del turno';
    document.getElementById('end-close').textContent = 'Continuar';
    document.getElementById('end-body').textContent =
      `Turno ${state.turnoIndex + 1} completo. Ganaste $${state.dinero} (requisito $${requisito}). ` +
      `Nueva regla: ${nextTurnoData.regla.descripcion}`;
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function endGame(reason, extra) {
    state.gameOver = true;
    stopTimer();
    const mensajes = {
      errores: `Alcanzaste el limite de ${LIMITE_ERRORES} errores. Quedas despedido.`,
      dinero: `No llegaste al minimo del turno ($${extra}, ganaste $${state.dinero}). No podes pagar tus cuentas.`,
      victoria: `Cumpliste todos los turnos. Correctas: ${state.correct}. Incorrectas: ${state.incorrect}.`,
    };
    document.getElementById('end-title').textContent = reason === 'victoria' ? 'Victoria' : 'Fin de la partida';
    document.getElementById('end-close').textContent = 'Reiniciar partida';
    document.getElementById('end-body').textContent = mensajes[reason];
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function onEndModalClose() {
    document.getElementById('end-modal').classList.add('hidden');
    if (state.gameOver) {
      location.reload();
      return;
    }
    const nextTurnoData = window.TURNOS[state.turnoIndex + 1];
    if (nextTurnoData) {
      state.turnoIndex += 1;
      state.reglasActivas = window.TURNOS.slice(0, state.turnoIndex + 1).map((t) => resolveHoyPlaceholder(t.regla));
      state.attendeeIndexInTurno = 0;
      state.dinero = 0;
      renderReglamento();
      updateScoreDisplay();
    }
    showDiaModal();
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
      if (state.errores >= LIMITE_ERRORES) {
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
  }

  async function init() {
    state.rng = Engine.createSeededRng((Date.now() >>> 0));
    state.reglasActivas = [resolveHoyPlaceholder(window.TURNOS[0].regla)];
    document.getElementById('fecha-actual').textContent = Domains.FECHA_ACTUAL;

    const { createAvatar } = await import('https://esm.sh/@dicebear/core@9');
    const { avataaars } = await import('https://esm.sh/@dicebear/collection@9');
    state.createAvatar = createAvatar;
    state.avataaars = avataaars;

    document.getElementById('turno-total').textContent = String(window.TURNOS.length);
    renderReglamento();
    updateScoreDisplay();
    wireDrag();
    showDiaModal();
  }

  init();
})();
