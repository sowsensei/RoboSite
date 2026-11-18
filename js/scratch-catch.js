(() => {
  const game = document.getElementById('catch-game');
  const stage = document.getElementById('catch-stage');
  const player = document.getElementById('catch-player');
  const starTemplate = document.getElementById('catch-star');
  const scoreDisplay = document.getElementById('catch-score');
  const missDisplay = document.getElementById('catch-misses');
  const result = document.getElementById('catch-result');
  const mode = document.getElementById('catch-mode');
  const action = document.getElementById('catch-action');
  const pressed = new Set();
  const target = 25;
  const missLimit = 3;
  const cloneInterval = 1.15;
  const groundY = .88;
  let playerX = .5;
  let stars = [];
  let score = 0;
  let misses = 0;
  let untilNextClone = cloneInterval;
  let state = 'ready';
  let lastTime = null;
  let frameId;

  function draw() {
    player.style.left = playerX * 100 + '%';
    for (const star of stars) {
      star.element.style.left = star.x * 100 + '%';
      star.element.style.top = star.y * 100 + '%';
    }
  }

  function updateCounters() {
    scoreDisplay.textContent = score + ' / ' + target;
    missDisplay.textContent = misses + ' / ' + missLimit;
  }

  function movePlayer(x) {
    const edge = player.offsetWidth / (2 * stage.clientWidth);
    playerX = Math.max(edge, Math.min(1 - edge, x));
  }

  function addStar(x = .1 + Math.random() * .8, y = -.14) {
    const element = starTemplate.content.firstElementChild.cloneNode(true);
    stage.appendChild(element);
    stars.push({ x, y, element });
  }

  function resetRound(preview = false) {
    for (const star of stars) star.element.remove();
    stars = [];
    score = 0;
    misses = 0;
    playerX = .5;
    untilNextClone = cloneInterval;
    if (preview) addStar(.5, .2);
    else addStar();
    updateCounters();
    draw();
  }

  function setState(next) {
    state = next;
    stage.toggleAttribute('data-playing', next === 'playing');
    result.hidden = next !== 'won' && next !== 'lost';
    result.toggleAttribute('data-lost', next === 'lost');
    if (next === 'won') result.textContent = 'Победа! Ты поймал ' + target + ' звёзд.';
    if (next === 'lost') result.textContent = 'Игра окончена. Ты пропустил ' + missLimit + ' звезды.';
    action.textContent = {
      ready: 'Играть',
      playing: 'Пауза',
      paused: 'Продолжить',
      won: 'Играть снова',
      lost: 'Играть снова'
    }[next];
    if (next !== 'playing') {
      cancelAnimationFrame(frameId);
      pressed.clear();
    }
  }

  function tick(time) {
    if (state !== 'playing') return;
    const elapsed = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .05);
    lastTime = time;
    const direction = Number(pressed.has('ArrowRight')) - Number(pressed.has('ArrowLeft'));
    if (direction) movePlayer(playerX + direction * elapsed);

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;
    const remaining = [];
    let finished = false;
    for (const star of stars) {
      if (finished) {
        remaining.push(star);
        continue;
      }
      star.y += .43 * elapsed;
      const caught = Math.abs(star.y - groundY) * height < (playerHeight + star.element.offsetHeight) / 2
        && Math.abs(playerX - star.x) * width < (playerWidth + star.element.offsetWidth) / 2;
      const missed = star.y - star.element.offsetHeight / (2 * height) >= 1;
      if (!caught && !missed) {
        remaining.push(star);
        continue;
      }
      if (caught) score++;
      else misses++;
      star.element.remove();
      updateCounters();
      finished = score >= target || misses >= missLimit;
    }
    stars = remaining;
    if (finished) {
      draw();
      setState(score >= target ? 'won' : 'lost');
      return;
    }

    if (mode.value === 'clones') {
      untilNextClone -= elapsed;
      if (untilNextClone <= 0) {
        addStar();
        untilNextClone += cloneInterval;
      }
    } else if (!stars.length) {
      addStar();
    }
    draw();
    frameId = requestAnimationFrame(tick);
  }

  action.addEventListener('click', () => {
    if (state === 'playing') {
      setState('paused');
      return;
    }
    if (state !== 'paused') resetRound();
    lastTime = null;
    setState('playing');
    stage.focus({ preventScroll: true });
    frameId = requestAnimationFrame(tick);
  });

  mode.addEventListener('change', () => {
    setState('ready');
    resetRound(true);
  });
  resetRound(true);

  stage.addEventListener('keydown', event => {
    if (state !== 'playing' || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    pressed.add(event.key);
  });
  stage.addEventListener('keyup', event => pressed.delete(event.key));
  stage.addEventListener('blur', () => pressed.clear());

  function steer(event) {
    const bounds = stage.getBoundingClientRect();
    movePlayer((event.clientX - bounds.left) / bounds.width);
    draw();
  }

  stage.addEventListener('pointerdown', event => {
    if (state !== 'playing' || !event.isPrimary || event.button !== 0) return;
    stage.focus({ preventScroll: true });
    stage.setPointerCapture(event.pointerId);
    steer(event);
  });
  stage.addEventListener('pointermove', event => {
    if (state === 'playing' && stage.hasPointerCapture(event.pointerId)) steer(event);
  });

  game.addEventListener('focusout', event => {
    if (state === 'playing' && event.relatedTarget && !game.contains(event.relatedTarget)) {
      setState('paused');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') setState('paused');
  });
})();
