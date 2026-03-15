import { Hono } from 'hono';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';

const reportRouter = new Hono();

reportRouter.get('/', requireAuth, async (c) => {
  const userId = c.get('userId');
  const username = c.get('username');
  const db = getDb();

  const illnesses = db.prepare('SELECT * FROM illnesses ORDER BY start_date DESC').all();
  const prescriptions = db
    .prepare(`
    SELECT p.*, i.name as illness_name, d.name as doctor_name
    FROM prescriptions p
    LEFT JOIN illnesses i ON p.illness_id = i.id
    LEFT JOIN doctors d ON p.doctor_id = d.id
    ORDER BY p.start_date DESC
  `)
    .all();
  const appointments = db
    .prepare(`
    SELECT a.*, i.name as illness_name
    FROM appointments a
    LEFT JOIN illnesses i ON a.illness_id = i.id
    ORDER BY a.date DESC
  `)
    .all();
  const doctors = db.prepare('SELECT * FROM doctors ORDER BY name').all();
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Healthdiary Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { color: #764ba2; margin-top: 30px; margin-bottom: 15px; border-left: 4px solid #764ba2; padding-left: 10px; }
    h3 { color: #4a5568; margin: 15px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f7fafc; color: #667eea; }
    tr:nth-child(even) { background: #f9f9f9; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .card { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .value { color: #4a5568; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status.active { background: #fef3c7; color: #d97706; }
    .status.resolved { background: #d1fae5; color: #059669; }
    .status.chronic { background: #dbeafe; color: #2563eb; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1><i class="fas fa-heartbeat"></i> Healthdiary - Report Salute</h1>
  <p><strong>Utente:</strong> ${username}</p>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>

  ${
    profile
      ? `
  <div class="section">
    <h2><i class="fas fa-user"></i> Profilo Personale</h2>
    <div class="card">
      <p><span class="label">Data di nascita:</span> <span class="value">${profile.birth_date || 'Non specificata'}</span></p>
      <p><span class="label">Gruppo sanguigno:</span> <span class="value">${profile.blood_type || 'Non specificato'}</span></p>
      <p><span class="label">Altezza:</span> <span class="value">${profile.height ? profile.height + ' cm' : 'Non specificata'}</span></p>
      <p><span class="label">Peso:</span> <span class="value">${profile.weight ? profile.weight + ' kg' : 'Non specificato'}</span></p>
      <p><span class="label">Allergie:</span> <span class="value">${profile.allergies || 'Nessuna'}</span></p>
      <p><span class="label">Condizioni croniche:</span> <span class="value">${profile.chronic_conditions || 'Nessuna'}</span></p>
      <p><span class="label">Contatto emergenza:</span> <span class="value">${profile.emergency_contact_name || 'Non specificato'} - ${profile.emergency_contact_phone || ''} (${profile.emergency_contact_relationship || ''})</span></p>
    </div>
  </div>
  `
      : ''
  }

  <div class="section">
    <h2><i class="fas fa-user-md"></i> Medici</h2>
    ${
      doctors.length === 0
        ? '<p>Nessun medico registrato</p>'
        : `
    <table>
      <thead>
        <tr><th>Nome</th><th>Specialità</th><th>Telefono</th><th>Email</th></tr>
      </thead>
      <tbody>
        ${doctors
          .map(
            (d: any) => `<tr>
          <td>${d.name}</td>
          <td>${d.specialty || '-'}</td>
          <td>${d.phone || '-'}</td>
          <td>${d.email || '-'}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
    `
    }
  </div>

  <div class="section">
    <h2><i class="fas fa-user-injured"></i> Malattie</h2>
    ${
      illnesses.length === 0
        ? '<p>Nessuna malattia registrata</p>'
        : `
    <table>
      <thead>
        <tr><th>Nome</th><th>Data inizio</th><th>Data fine</th><th>Stato</th></tr>
      </thead>
      <tbody>
        ${illnesses
          .map(
            (i: any) => `<tr>
          <td>${i.name}</td>
          <td>${new Date(i.start_date).toLocaleDateString('it-IT')}</td>
          <td>${i.end_date ? new Date(i.end_date).toLocaleDateString('it-IT') : '-'}</td>
          <td><span class="status ${i.status}">${i.status === 'active' ? 'Attiva' : i.status === 'resolved' ? 'Risolta' : 'Cronica'}</span></td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
    `
    }
  </div>

  <div class="section">
    <h2><i class="fas fa-pills"></i> Farmaci</h2>
    ${
      prescriptions.length === 0
        ? '<p>Nessuna prescrizione registrata</p>'
        : `
    <table>
      <thead>
        <tr><th>Farmaco</th><th>Dosaggio</th><th>Frequenza</th><th>Inizio</th><th>Fine</th></tr>
      </thead>
      <tbody>
        ${prescriptions
          .map(
            (p: any) => `<tr>
          <td>${p.medication}</td>
          <td>${p.dosage || '-'}</td>
          <td>${p.frequency || '-'}</td>
          <td>${new Date(p.start_date).toLocaleDateString('it-IT')}</td>
          <td>${p.end_date ? new Date(p.end_date).toLocaleDateString('it-IT') : '-'}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
    `
    }
  </div>

  <div class="section">
    <h2><i class="fas fa-calendar-check"></i> Appuntamenti</h2>
    ${
      appointments.length === 0
        ? '<p>Nessun appuntamento registrato</p>'
        : `
    <table>
      <thead>
        <tr><th>Medico</th><th>Specialità</th><th>Data</th><th>Luogo</th></tr>
      </thead>
      <tbody>
        ${appointments
          .map(
            (a: any) => `<tr>
          <td>${a.doctor_name}</td>
          <td>${a.specialty || '-'}</td>
          <td>${new Date(a.date).toLocaleDateString('it-IT')}${a.time ? ' ' + a.time : ''}</td>
          <td>${a.location || '-'}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
    `
    }
  </div>

  <div class="footer">
    <p>Generato da Healthdiary il ${new Date().toLocaleString('it-IT')}</p>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"></script>
</body>
</html>`;

  c.header('Content-Type', 'text/html; charset=utf-8');
  return c.html(html);
});

export default reportRouter;
