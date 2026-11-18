const theoryQuestions = [
  ['Что запускает блок «когда щёлкнут по зелёному флагу»?', 'Скрипт под этим блоком', 'Только смену костюма', 'Только скрипты сцены', 'Зелёный флаг запускает скрипты, начинающиеся с этого события.'],
  ['Как спрайты могут передать друг другу сигнал?', 'Через сообщение', 'Через смену костюма', 'Через поворот спрайта', 'Один спрайт передаёт сообщение, другой запускает скрипт по его получении.'],
  ['Куда движется спрайт, когда его координата по «оси X» увеличивается?', 'Вправо', 'Вверх', 'Влево', '«Ось X» расположена горизонтально. Чем больше координата X, тем правее спрайт.'],
  ['Зачем при старте игры задавать счёту значение 0?', 'Чтобы сбросить очки прошлой игры', 'Чтобы спрятать счёт со сцены', 'Чтобы остановить игру', 'При новом запуске переменная может сохранить старое значение, если её не обнулить.'],
  ['Что делает блок «касается указателя мыши?»', 'Проверяет, есть ли касание', 'Перемещает спрайт к указателю', 'Запускает скрипт по щелчку', 'Блок возвращает результат проверки, который можно использовать внутри «если».'],
  ['Что может выдать блок «случайное от 1 до 3»?', '1, 2 или 3', 'Только 1 или 2', 'Только 2 или 3', 'При целых границах блок выбирает целое число, включая обе границы.'],
  ['Что такое клон в Scratch?', 'Копия спрайта, которая может выполнять скрипты', 'Другой костюм того же спрайта', 'Копия всей сцены', 'Клоны пригодятся, например, для создания нескольких падающих предметов.'],
  ['Чем костюм отличается от спрайта?', 'Костюм меняет внешний вид спрайта', 'Каждый костюм управляется отдельным набором скриптов', 'Костюм заменяет фон сцены', 'Один спрайт может менять костюмы в ходе работы программы.'],
  ['Что делает блок «повторять всегда»?', 'Выполняет команды внутри, пока скрипт работает', 'Выполняет команды внутри один раз', 'Повторяет команды только при нажатой клавише', 'Этот цикл не имеет заданного числа повторов.'],
  ['Что происходит в блоке «ждать до…»?', 'Скрипт ждёт, пока условие станет истинным', 'Скрипт ждёт фиксированное число секунд', 'Условие проверяется только один раз', 'Скрипт продолжится, когда проверка даст ответ «да».'],
  ['Когда условие «A и B» истинно?', 'Когда истинны оба условия', 'Когда истинно хотя бы одно из условий', 'Когда оба условия ложны', 'Для блока «и» нужны два ответа «да».'],
  ['Что сделает блок «передать сообщение и ждать»?', 'Дождётся завершения скриптов, запущенных сообщением', 'Отправит сообщение только после паузы', 'Продолжит сразу после отправки', 'Скрипт продолжится, когда закончат работу скрипты, запущенные этим сообщением.'],
  ['Что произойдёт, если изменить координату спрайта по «оси Y» на отрицательное число?', 'Спрайт сместится вниз', 'Спрайт сместится вверх', 'Спрайт сместится влево', '«Ось Y» расположена вертикально. Уменьшение координаты Y перемещает спрайт вниз.'],
  ['Для чего удобнее использовать список?', 'Чтобы хранить несколько результатов по порядку', 'Чтобы хранить одно значение скорости', 'Чтобы заменить блок поворота', 'У списка есть элементы с номерами. Можно читать и менять каждый по отдельности.'],
  ['С какого номера начинаются элементы списка в Scratch?', 'С 1', 'С 0', 'С 2', 'Первый элемент списка имеет номер 1.'],
  ['Герой касается монеты несколько кадров подряд. Как начислить очко один раз за эту монету?', 'Сразу убрать монету из зоны касания', 'Начислять очко при каждом проходе цикла', 'Каждый раз при касании устанавливать счёт в 1', 'Если сразу переместить или удалить монету, следующая проверка не засчитает то же касание ещё раз.']
].map(([question, correct, wrongOne, wrongTwo, explanation]) => ({
  question,
  options: [correct, wrongOne, wrongTwo],
  answer: 0,
  explanation
}));

const theoryCount = 8;
let questions = [];

const form = document.getElementById('quiz-form');
const container = document.getElementById('questions');
const result = document.getElementById('quiz-result');
const start = document.getElementById('start-quiz');
const message = document.getElementById('quiz-message');
const dialog = document.getElementById('quiz-dialog');
const nav = document.getElementById('quiz-nav');
const previous = document.getElementById('previous-question');
let current = 0;
let score = 0;
let answers = [];

function scratchBlock(category, content) {
  return `<div class="scratch-block ${category}">${content}<span class="scratch-tab"></span></div>`;
}

function scratchBody(content) {
  return `<div class="scratch-body">${content}</div>`;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = randomInt(0, index);
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function argument(value) {
  return '<span class="scratch-argument">' + value + '</span>';
}

function repeatBlocks(times, content) {
  return scratchBlock('scratch-control', 'повторить ' + argument(times) + ' раз')
    + scratchBody(content)
    + scratchBlock('scratch-control scratch-tail', '↶');
}

function numberQuestion(question, values, explanation, code, blocks) {
  return { question, options: values.map(String), answer: 0, explanation, code, blocks };
}

function movementQuestion() {
  const times = randomInt(2, 8);
  const steps = randomInt(4, 12);
  const total = times * steps;
  return numberQuestion(
    'Сколько шагов пройдёт спрайт?',
    [total, steps, times + steps],
    'Команда движения выполняется ' + times + ' раз. Всего ' + times + ' × ' + steps + ' = ' + total + ' шагов.',
    'повторить ' + times + ' раз: идти ' + steps + ' шагов',
    repeatBlocks(times, scratchBlock('', 'идти ' + argument(steps) + ' шагов'))
  );
}

function scoreQuestion() {
  const startScore = randomInt(0, 9);
  const first = randomInt(2, 5);
  const second = randomInt(6, 9);
  const total = startScore + first + second;
  return numberQuestion(
    'Счёт сначала равен ' + startScore + '. Каким он станет?',
    [total, startScore + first, startScore + second],
    'Обе команды прибавляют очки. Получаем ' + startScore + ' + ' + first + ' + ' + second + ' = ' + total + '.',
    'изменить счёт на ' + first + '; изменить счёт на ' + second,
    scratchBlock('scratch-variable', 'изменить счёт на ' + argument(first))
      + scratchBlock('scratch-variable', 'изменить счёт на ' + argument(second))
  );
}

function branchQuestion() {
  const limit = randomInt(5, 10);
  const x = limit + randomInt(-2, 2);
  const multiplier = randomInt(2, 4);
  const fallback = randomInt(0, 2);
  const product = x * multiplier;
  const isGreater = x > limit;
  const condition = x + (isGreater ? ' больше ' : ' не больше ') + limit + '. ';
  return numberQuestion(
    'При x = ' + x + ' чему будет равно y?',
    [isGreater ? product : fallback, isGreater ? fallback : product, product + 1],
    condition + (isGreater ? 'Первая ветка даёт ' + x + ' × ' + multiplier + ' = ' + product + '.'
      : 'Выполняется ветка «иначе», и y получает значение ' + fallback + '.'),
    'если x > ' + limit + ', то задать y значение x × ' + multiplier + '; иначе задать y значение ' + fallback,
    scratchBlock('scratch-control', 'если <span class="scratch-condition">x &gt; ' + limit + '</span> то')
      + scratchBody(scratchBlock('scratch-variable', 'задать y значение <span class="scratch-operator">x × ' + multiplier + '</span>'))
      + scratchBlock('scratch-control scratch-branch', 'иначе')
      + scratchBody(scratchBlock('scratch-variable', 'задать y значение ' + argument(fallback)))
      + scratchBlock('scratch-control scratch-tail', '')
  );
}

function nestedQuestion() {
  const outer = randomInt(2, 4);
  const inner = randomInt(2, 5);
  const points = randomInt(2, 4);
  const total = outer * inner * points;
  return numberQuestion(
    'На сколько увеличится счёт?',
    [total, inner * points, total + points],
    'Внутренний цикл выполнится целиком при каждом повторе внешнего. Получаем ' + outer + ' × ' + inner + ' × ' + points + ' = ' + total + '.',
    'повторить ' + outer + ' раз: повторить ' + inner + ' раз: изменить счёт на ' + points,
    repeatBlocks(outer, repeatBlocks(inner, scratchBlock('scratch-variable', 'изменить счёт на ' + argument(points))))
  );
}

function coordinateQuestion() {
  const startX = randomInt(-12, -3);
  const change = randomInt(2, 9);
  const times = randomInt(2, 4);
  const total = startX + times * change;
  return numberQuestion(
    'Какой станет координата спрайта по «оси X» после выполнения всех блоков?',
    [total, startX + change, times * change],
    'Сначала задаётся x = ' + startX + '. Затем прибавляем ' + change + ' по ' + times + ' раза. Итог: ' + total + '.',
    'установить x в ' + startX + '; повторить ' + times + ' раз: изменить x на ' + change,
    scratchBlock('', 'установить x в ' + argument(startX))
      + repeatBlocks(times, scratchBlock('', 'изменить x на ' + argument(change)))
  );
}

function listQuestion() {
  const evenCount = randomInt(1, 5);
  const even = shuffle([2, 4, 6, 8, 10, 12]);
  const odd = shuffle([1, 3, 5, 7, 9, 11]);
  const list = shuffle([...even.slice(0, evenCount), ...odd.slice(0, 6 - evenCount)]);
  return numberQuestion(
    'В списке числа ' + list.join(', ') + '. Сколько из них чётных?',
    [evenCount, evenCount - 1, evenCount + 1],
    'Чётные числа в этом списке: ' + list.filter(number => number % 2 === 0).join(', ') + '.'
  );
}

function createAttempt() {
  const selected = shuffle(theoryQuestions).slice(0, theoryCount);
  const tasks = [movementQuestion(), scoreQuestion(), branchQuestion(), nestedQuestion(), coordinateQuestion(), listQuestion()];
  return shuffle([...selected, ...tasks]).map(item => {
    const options = shuffle(item.options);
    return { ...item, options, answer: options.indexOf(item.options[item.answer]) };
  });
}

function makeBlocks(item) {
  const blocks = document.createElement('div');
  blocks.className = 'scratch-blocks';
  const stack = document.createElement('div');
  stack.className = 'scratch-stack';
  stack.setAttribute('role', 'img');
  stack.setAttribute('aria-label', item.code);
  stack.innerHTML = item.blocks;
  blocks.appendChild(stack);
  if (stack.querySelector('.scratch-body')) {
    const guide = document.createElement('p');
    guide.className = 'scratch-guide';
    guide.textContent = 'Пунктир показывает границы вложения';
    blocks.appendChild(guide);
  }
  return blocks;
}

function showQuestion() {
  const item = questions[current];
  container.replaceChildren();
  message.textContent = '';
  form.querySelector('button[type="submit"]').textContent = current === questions.length - 1 ? 'Завершить тест' : 'Вперёд';
  previous.disabled = current === 0;
  nav.replaceChildren();
  questions.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = index + 1;
    button.classList.toggle('answered', answers[index] !== undefined);
    button.classList.toggle('active', index === current);
    button.setAttribute('aria-label', `Вопрос ${index + 1}${answers[index] !== undefined ? ', ответ дан' : ', нет ответа'}`);
    if (index === current) button.setAttribute('aria-current', 'step');
    button.addEventListener('click', () => { current = index; showQuestion(); });
    nav.appendChild(button);
  });
  const field = document.createElement('fieldset');
  field.className = 'quiz-question';
  const legend = document.createElement('legend');
  legend.textContent = item.question;
  field.appendChild(legend);
  if (item.blocks) {
    field.appendChild(makeBlocks(item));
  }
  const options = document.createElement('div');
  options.className = 'quiz-options';
  item.options.forEach((option, optionIndex) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = optionIndex;
    input.checked = answers[current] === optionIndex;
    input.addEventListener('change', () => { answers[current] = optionIndex; showQuestion(); container.querySelector('input:checked').focus(); });
    label.append(input, document.createTextNode(option));
    options.appendChild(label);
  });
  field.appendChild(options);
  container.appendChild(field);
}

function beginQuiz() {
  questions = createAttempt();
  current = 0;
  score = 0;
  answers = [];
  start.hidden = true;
  result.hidden = true;
  result.replaceChildren();
  form.hidden = false;
  nav.hidden = false;
  if (!dialog.open) dialog.showModal();
  showQuestion();
  dialog.scrollTop = 0;
}

start.addEventListener('click', beginQuiz);
document.getElementById('close-quiz').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { start.hidden = false; });
previous.addEventListener('click', () => { if (current > 0) { current--; showQuestion(); } });

form.addEventListener('submit', event => {
  event.preventDefault();
  if (current < questions.length - 1) {
    current++;
    showQuestion();
    return;
  }
  const missing = questions.findIndex((_, index) => answers[index] === undefined);
  if (missing !== -1) {
    message.textContent = `Ответь на все вопросы. Без ответа: вопрос ${missing + 1}.`;
    return;
  }
  score = questions.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
  form.hidden = true;
  nav.hidden = true;
  result.hidden = false;
  const heading = document.createElement('h2');
  heading.textContent = `Результат: ${score} из ${questions.length}`;
  result.appendChild(heading);
  const intro = document.createElement('p');
  intro.textContent = 'Правильные ответы и пояснения:';
  result.appendChild(intro);
  questions.forEach((item, index) => {
    const card = document.createElement('div');
    const correct = answers[index] === item.answer;
    card.className = `quiz-question ${correct ? 'quiz-result-correct' : 'quiz-result-wrong'}`;
    const title = document.createElement('strong');
    title.textContent = `${index + 1}. ${item.question}`;
    const answer = document.createElement('p');
    answer.className = 'mb-0 mt-2';
    answer.textContent = `${item.options[item.answer]}. ${item.explanation}`;
    card.appendChild(title);
    if (item.blocks) {
      card.appendChild(makeBlocks(item));
    }
    const status = document.createElement('p');
    status.className = 'quiz-result-status mb-0 mt-2';
    status.textContent = correct ? '✓ Верно' : '✕ Ошибка';
    card.appendChild(status);
    card.appendChild(answer);
    result.appendChild(card);
  });
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'quiz-start';
  retry.textContent = 'Пройти ещё раз';
  retry.addEventListener('click', beginQuiz);
  result.appendChild(retry);
  result.focus();
});
