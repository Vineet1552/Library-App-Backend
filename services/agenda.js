const Agenda = require('agenda');
const sendMail = require('../services/nodeMailer');
const mongoConnectionString = process.env.DB_URL;

// Initialize Agenda
const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'agendaJobs' } });

agenda.define('func return book', async job => {
    const { email } = job.attrs.data;
    await sendMail(email, "Return Reminder", "Please return the book.");
});

(async function() {
    await agenda.start();
    console.log('Agenda started');
})();

module.exports = agenda;