const employees = [
  { id: 'mc', name: 'María Camila Torres', role: 'Administración', initials: 'MT', color: '#db9272', streak: 12, badge: '🥇' },
  { id: 'jl', name: 'Juan Sebastián López', role: 'Coordinación académica', initials: 'JL', color: '#789dc9', streak: 10, badge: '⚡' },
  { id: 'av', name: 'Andrea Valentina Ruiz', role: 'Bienestar universitario', initials: 'AR', color: '#a382c1', streak: 9, badge: '🌟' },
  { id: 'dp', name: 'Daniel Felipe Pérez', role: 'Servicios generales', initials: 'DP', color: '#63a890', streak: 8, badge: '🔥' },
  { id: 'sg', name: 'Sofía Gómez Ramírez', role: 'Talento humano', initials: 'SG', color: '#df9e5e', streak: 7, badge: '✨' },
  { id: 'cr', name: 'Carlos Andrés Rojas', role: 'Tecnología', initials: 'CR', color: '#738ac3', streak: 6, badge: '🌱' },
  { id: 'lm', name: 'Laura Marcela Díaz', role: 'Comunicaciones', initials: 'LD', color: '#ce7f90', streak: 5, badge: '🌼' },
  { id: 'nr', name: 'Nicolás Ramírez', role: 'Admisiones', initials: 'NR', color: '#65a7a2', streak: 4, badge: '☀️' }
];

const today = new Date();
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shiftedDate = (days) => { const date = new Date(today); date.setDate(date.getDate() + days); return date; };
const dateLabel = (date, options = { day: '2-digit', month: 'short' }) => new Intl.DateTimeFormat('es-CO', options).format(date).replace('.', '');
const makeRecord = (personId, daysAgo, time, type, state = 'A tiempo') => ({
  id: `${personId}-${daysAgo}-${time}-${type}-${Math.random().toString(36).slice(2, 6)}`,
  employeeId: personId,
  date: dateKey(shiftedDate(-daysAgo)),
  time,
  type,
  state,
  location: 'Sede Central URNA · Bogotá'
});

const records = [];
const weekdayEntries = ['07:48', '07:56', '07:51', '08:04', '07:43', '08:11', '07:59', '07:52'];
const todayEntries = ['07:42', '07:51', '07:56', '08:02', '08:09', '07:47', '08:14'];
const todayExits = ['12:05', '12:18'];
// Datos de demostración de esta semana y de la actividad reciente.
for (let ago = 0; ago < 7; ago++) {
  if (shiftedDate(-ago).getDay() === 0) continue;
  const count = ago === 0 ? todayEntries.length : 6 + (ago % 3);
  for (let i = 0; i < count; i++) {
    const person = employees[(i + ago) % employees.length];
    const time = ago === 0 ? todayEntries[i] : weekdayEntries[(i + ago) % weekdayEntries.length];
    const late = time > '08:05';
    records.push(makeRecord(person.id, ago, time, 'Entrada', late ? 'Tarde' : 'A tiempo'));
  }
  if (ago === 0) {
    todayExits.forEach((time, index) => records.push(makeRecord(employees[index + 1].id, 0, time, 'Salida')));
  } else if (ago < 4) {
    for (let i = 0; i < 4; i++) records.push(makeRecord(employees[(i + ago) % employees.length].id, ago, ['16:02', '16:14', '16:21', '16:08'][i], 'Salida'));
  }
}
// Unos registros del viernes anterior para que el historial tenga contexto.
for (let i = 0; i < 5; i++) {
  records.push(makeRecord(employees[(i + 2) % employees.length].id, 8, weekdayEntries[i], 'Entrada', i === 3 ? 'Tarde' : 'A tiempo'));
  if (i < 3) records.push(makeRecord(employees[(i + 2) % employees.length].id, 8, ['16:09', '16:18', '16:05'][i], 'Salida'));
}

let selectedType = 'Entrada';
let extraHours = 0;
let toastTimer;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const getEmployee = (id) => employees.find((employee) => employee.id === id) || employees[0];
const sortedRecords = () => [...records].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
const recordsToday = () => records.filter((record) => record.date === dateKey(today));

function populateEmployees() {
  $('#employee-select').innerHTML = employees.map((employee) => `<option value="${employee.id}">${employee.name}</option>`).join('');
}

function renderRecent() {
  const latest = sortedRecords().slice(0, 3);
  $('#recent-list').innerHTML = latest.map((record) => {
    const employee = getEmployee(record.employeeId);
    const time = record.date === dateKey(today) ? record.time : `${dateLabel(new Date(`${record.date}T12:00:00`))} · ${record.time}`;
    return `<div class="recent-item"><div class="mini-avatar" style="background:${employee.color}">${employee.initials}</div><div class="recent-person"><b>${escapeHtml(employee.name)}</b><small>${record.type} · ${time}</small></div><div class="recent-meta"><b>${record.time}</b><small class="${record.state === 'Tarde' ? 'status-late' : ''}">${record.state === 'Tarde' ? 'Con retraso' : 'A tiempo'}</small></div></div>`;
  }).join('');
}

function renderTodayStats() {
  const todays = recordsToday();
  const entries = todays.filter((record) => record.type === 'Entrada');
  const exits = todays.filter((record) => record.type === 'Salida');
  const registered = new Set(entries.map((record) => record.employeeId)).size;
  $('#today-entries').textContent = entries.length;
  $('#today-exits').textContent = exits.length;
  $('#dashboard-entries').textContent = entries.length;
  $('#dashboard-exits').textContent = exits.length;
  $('#registered-label').textContent = `${registered} de ${employees.length}`;
  $('#registered-progress').style.width = `${Math.min(100, registered / employees.length * 100)}%`;
}

function renderMetrics(period = 'week') {
  const now = dateKey(today);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const periodStart = period === 'month' ? dateKey(new Date(today.getFullYear(), today.getMonth(), 1)) : dateKey(weekStart);
  const periodRecords = records.filter((record) => record.date >= periodStart && record.date <= now && record.type === 'Entrada');
  const onTime = periodRecords.filter((record) => record.state === 'A tiempo').length;
  const score = periodRecords.length ? Math.round(onTime / periodRecords.length * 100) : 0;
  $('#punctuality-value').textContent = score;
  $('#hours-value').textContent = (1284 + extraHours).toLocaleString('en-US');
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const bars = days.map((date) => {
    if (date > today) return 0;
    const dayRecords = records.filter((record) => record.date === dateKey(date) && record.type === 'Entrada');
    const rate = dayRecords.length ? dayRecords.filter((record) => record.state === 'A tiempo').length / dayRecords.length : (date.getDay() === 0 || date.getDay() === 6 ? 0 : .85);
    return Math.max(7, Math.round(rate * 100));
  });
  $('#mini-bars').innerHTML = bars.map((height) => `<i style="height:${height}%"></i>`).join('');
  renderChart(bars);
}

function renderChart(values) {
  const width = 600;
  const height = 160;
  const points = values.map((value, index) => ({ x: 12 + index * 96, y: height - (value / 100) * (height - 15) }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const circles = points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#fff" stroke="#45ad75" stroke-width="3"/>`).join('');
  $('#chart-draw').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Gráfico de puntualidad semanal"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#61bd83" stop-opacity=".2"/><stop offset="100%" stop-color="#61bd83" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#chartFill)"/><path d="${path}" fill="none" stroke="#48ad75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${circles}</svg>`;
}

function renderLeaderboard() {
  const rankings = [...employees].sort((a, b) => b.streak - a.streak).slice(0, 5);
  $('#leader-list').innerHTML = rankings.map((employee, index) => `<div class="leader-row"><span class="rank-num">${String(index + 1).padStart(2, '0')}</span><span class="leader-avatar" style="background:${employee.color}">${employee.initials}</span><span class="leader-name"><b>${escapeHtml(employee.name.split(' ').slice(0, 2).join(' '))}</b><small>${employee.badge} ${index === 0 ? 'Leyenda del equipo' : 'Racha imparable'}</small></span><span class="leader-streak">🔥 ${employee.streak}d</span></div>`).join('');
}

function renderHistory() {
  const query = $('#search-input').value.trim().toLocaleLowerCase('es');
  const date = $('#date-filter').value;
  const filtered = sortedRecords().filter((record) => {
    const employee = getEmployee(record.employeeId);
    return (!query || employee.name.toLocaleLowerCase('es').includes(query)) && (!date || record.date === date);
  });
  $('#record-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  $('#empty-state').classList.toggle('hidden', filtered.length > 0);
  $('.table-wrap').classList.toggle('hidden', filtered.length === 0);
  $('#mobile-record-list').classList.toggle('hidden', filtered.length === 0);
  const rows = filtered.map((record) => {
    const employee = getEmployee(record.employeeId);
    const dateObj = new Date(`${record.date}T12:00:00`);
    const recordDate = record.date === dateKey(today) ? `Hoy, ${dateLabel(dateObj)}` : dateLabel(dateObj, { day: '2-digit', month: 'short', year: 'numeric' });
    const typeClass = record.type === 'Entrada' ? 'entry' : 'exit';
    const symbol = record.type === 'Entrada' ? '↘' : '↗';
    return { record, employee, recordDate, typeClass, symbol };
  });
  $('#history-body').innerHTML = rows.map(({ record, employee, recordDate, typeClass, symbol }) => `<tr><td><div class="employee-cell"><span class="mini-avatar" style="background:${employee.color}">${employee.initials}</span><span><b>${escapeHtml(employee.name)}</b><small>${escapeHtml(employee.role)}</small></span></div></td><td>${recordDate} · ${record.time}</td><td><span class="record-type ${typeClass}"><i>${symbol}</i>${record.type}</span></td><td><span class="status-pill ${record.state === 'Tarde' ? 'late' : 'on-time'}">${record.state}</span></td><td class="location-cell">⌖ &nbsp;${record.location}</td></tr>`).join('');
  $('#mobile-record-list').innerHTML = rows.map(({ record, employee, recordDate, typeClass, symbol }) => `<div class="mobile-record"><div class="mobile-record-top"><div class="employee-cell"><span class="mini-avatar" style="background:${employee.color}">${employee.initials}</span><span><b>${escapeHtml(employee.name)}</b><small>${escapeHtml(employee.role)}</small></span></div><span class="mobile-record-time">${recordDate}<br><b>${record.time}</b></span></div><div class="mobile-record-bottom"><span class="record-type ${typeClass}"><i>${symbol}</i>${record.type}</span><span class="status-pill ${record.state === 'Tarde' ? 'late' : 'on-time'}">${record.state}</span><span class="mobile-location">⌖ Bogotá</span></div></div>`).join('');
}

function renderAll() {
  renderRecent();
  renderTodayStats();
  renderMetrics();
  renderLeaderboard();
  renderHistory();
}

function notify(message) {
  $('#toast-message').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3400);
}

function registerAttendance() {
  const button = $('#scan-button');
  if (button.disabled) return;
  button.disabled = true;
  button.innerHTML = '<span>◌</span> Buscando código QR…';
  const stage = $('#scan-stage');
  stage.classList.remove('success');
  stage.classList.add('scanning');
  $('#scanner-caption').textContent = 'Conectando con Chronos…';
  setTimeout(() => {
    const employee = getEmployee($('#employee-select').value);
    const current = new Date();
    const time = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
    const isLate = selectedType === 'Entrada' && time > '08:05';
    records.push({
      id: `live-${Date.now()}`,
      employeeId: employee.id,
      date: dateKey(current),
      time,
      type: selectedType,
      state: isLate ? 'Tarde' : 'A tiempo',
      location: 'Sede Central URNA · Bogotá'
    });
    if (selectedType === 'Salida') extraHours += 8;
    stage.classList.remove('scanning');
    stage.classList.add('success');
    $('#scanner-caption').textContent = `¡Listo, ${employee.name.split(' ')[0]}! ${selectedType.toLowerCase()} registrada`;
    button.innerHTML = '<span>✓</span> ¡Marcaje registrado! <span class="button-arrow">→</span>';
    renderAll();
    notify(`${employee.name} · ${selectedType} a las ${time}${isLate ? ' · Llegada tarde' : ''}`);
    setTimeout(() => {
      stage.classList.remove('success');
      $('#scanner-caption').textContent = 'Ubica el código dentro del marco';
      button.disabled = false;
      button.innerHTML = '<span>▦</span> Simular escaneo QR <span class="button-arrow">→</span>';
    }, 2200);
  }, 850);
}

function navigate(viewName) {
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${viewName}`));
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  const titles = { attendance: '¡Hola, María! ✦', dashboard: 'Estadísticas del equipo', history: 'Historial de marcajes' };
  $('#page-title').textContent = titles[viewName];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.view)));
document.querySelectorAll('.type-option').forEach((button) => button.addEventListener('click', () => {
  selectedType = button.dataset.type;
  document.querySelectorAll('.type-option').forEach((option) => option.classList.toggle('selected', option === button));
}));
$('#scan-button').addEventListener('click', registerAttendance);
$('#search-input').addEventListener('input', renderHistory);
$('#date-filter').addEventListener('change', renderHistory);
$('#clear-filters').addEventListener('click', () => { $('#search-input').value = ''; $('#date-filter').value = ''; renderHistory(); });
$('#period-select').addEventListener('change', (event) => renderMetrics(event.target.value));
$('#export-button').addEventListener('click', () => {
  const rows = [['Empleado', 'Fecha', 'Hora', 'Tipo', 'Estado', 'Ubicación'], ...sortedRecords().map((record) => [getEmployee(record.employeeId).name, record.date, record.time, record.type, record.state, record.location])];
  const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `chronos-registros-${dateKey(today)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  notify('Tu archivo de registros está listo.');
});

const todayLabel = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: '2-digit', month: 'short' }).format(today).toUpperCase().replace('.', '');
$('#today-label').textContent = dateLabel(today, { day: '2-digit', month: 'short' }).toUpperCase();
$('.topbar .eyebrow').childNodes[0].textContent = `${todayLabel.split(',')[0]}, `;
$('#date-chip').textContent = dateLabel(today, { day: '2-digit', month: 'short' }).toUpperCase();
populateEmployees();
renderAll();
