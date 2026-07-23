(function () {
  const SWIPE_THRESHOLD = 100;
  const DNI_KEYS = [
    'nombre', 'apellido', 'fechaNacimiento', 'genero', 'nacionalidad', 'ciudad',
    'lentes', 'velloFacial', 'tonoPiel', 'colorPelo', 'peinado',
  ];
  const INVITACION_CONFIG = { matchProbability: 0.7, vigenciaProbability: 0.85 };

  const state = {
    rng: null,
    idCounter: 0,
    turnoIndex: 0,
    reglasActivas: [],
    attendeeIndexInTurno: 0,
    correct: 0,
    incorrect: 0,
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
    const invitacion = Engine.generateInvitacion(dni, INVITACION_CONFIG, Domains.DOMAINS, state.rng);
    const avatarParams = Engine.assignAvatarParams(dni);
    return { dni, invitacion, avatarParams };
  }

  function avatarSvgFor(attendee) {
    const avatar = state.createAvatar(state.avataaars, { ...attendee.avatarParams, size: 96 });
    return avatar.toString();
  }

  function renderReglamento() {
    const list = document.getElementById('reglamento-list');
    list.innerHTML = '';
    for (const regla of state.reglasActivas) {
      const li = document.createElement('li');
      li.textContent = regla.descripcion;
      list.appendChild(li);
    }
  }

  function renderCard() {
    const a = state.current;
    document.getElementById('avatar-container').innerHTML = avatarSvgFor(a);
    document.getElementById('dni-nombre').textContent = a.dni.nombre;
    document.getElementById('dni-apellido').textContent = a.dni.apellido;
    document.getElementById('dni-fecha').textContent = a.dni.fechaNacimiento;
    document.getElementById('dni-genero').textContent = a.dni.genero;
    document.getElementById('dni-nacionalidad').textContent = a.dni.nacionalidad;
    document.getElementById('dni-ciudad').textContent = a.dni.ciudad;
    document.getElementById('inv-nombre').textContent = a.invitacion.nombre;
    document.getElementById('inv-apellido').textContent = a.invitacion.apellido;
    document.getElementById('inv-categoria').textContent = a.invitacion.categoriaAcceso;
    document.getElementById('inv-vigente').textContent = a.invitacion.vigente ? 'si' : 'no';
    card.style.transform = '';
    stamp.className = 'hidden';
  }

  function updateScoreDisplay() {
    document.getElementById('turno-value').textContent = String(state.turnoIndex + 1);
    document.getElementById('correct-value').textContent = String(state.correct);
    document.getElementById('incorrect-value').textContent = String(state.incorrect);
  }

  function showFeedback(wasCorrect, correctAction, chosenAction) {
    document.getElementById('feedback-title').textContent = wasCorrect ? 'Correcto' : 'Incorrecto';
    document.getElementById('feedback-body').textContent = wasCorrect
      ? `Hiciste bien en ${chosenAction}.`
      : `Elegiste ${chosenAction}, pero lo correcto era ${correctAction}.`;
    document.getElementById('feedback-modal').classList.remove('hidden');
  }

  function decide(chosenAction) {
    if (state.gameOver || !state.current) return;
    const correctAction = Engine.determineCorrectAction(state.reglasActivas, state.current);
    const wasCorrect = chosenAction === correctAction;
    if (wasCorrect) state.correct += 1; else state.incorrect += 1;
    updateScoreDisplay();
    showFeedback(wasCorrect, correctAction, chosenAction);
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
    const nextTurnoData = window.TURNOS[state.turnoIndex + 1];
    if (!nextTurnoData) {
      endGame();
      return;
    }
    document.getElementById('end-body').textContent =
      `Turno ${state.turnoIndex + 1} completo. Nueva regla: ${nextTurnoData.regla.descripcion}`;
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function endGame() {
    state.gameOver = true;
    document.getElementById('end-body').textContent =
      `Juego terminado. Correctas: ${state.correct}. Incorrectas: ${state.incorrect}.`;
    document.getElementById('end-modal').classList.remove('hidden');
  }

  function onEndModalClose() {
    document.getElementById('end-modal').classList.add('hidden');
    if (state.gameOver) return;
    const nextTurnoData = window.TURNOS[state.turnoIndex + 1];
    if (nextTurnoData) {
      state.turnoIndex += 1;
      state.reglasActivas = window.TURNOS.slice(0, state.turnoIndex + 1).map((t) => t.regla);
      state.attendeeIndexInTurno = 0;
      renderReglamento();
      updateScoreDisplay();
    }
    state.current = generateAttendee();
    renderCard();
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
      advance();
    });
    document.getElementById('end-close').addEventListener('click', onEndModalClose);
  }

  async function init() {
    state.rng = Engine.createSeededRng((Date.now() >>> 0));
    state.reglasActivas = [window.TURNOS[0].regla];

    const { createAvatar } = await import('https://esm.sh/@dicebear/core@9');
    const { avataaars } = await import('https://esm.sh/@dicebear/collection@9');
    state.createAvatar = createAvatar;
    state.avataaars = avataaars;

    document.getElementById('turno-total').textContent = String(window.TURNOS.length);
    renderReglamento();
    updateScoreDisplay();
    wireDrag();

    state.current = generateAttendee();
    renderCard();
  }

  init();
})();
