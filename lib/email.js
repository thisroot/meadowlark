const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (credentials) {
  // api key https://sendgrid.com/docs/Classroom/Send/api_keys.html
  const options = {
    auth: {
      api_key: credentials.sendgrid.apikey
    }
  };

  const mailTransport = nodemailer.createTransport(sgTransport(options));

  const from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
  const errorRecipient = 'youremail@gmail.com';

  return {
    send: function (to, subj, body) {
      mailTransport.sendMail({
        from: from,
        to: to,
        subject: subj,
        html: body,
        generateTextFromHtml: true
      }, function (err) {
        if (err) console.error('Unable to send email: ' + err);
      });
    },

    emailError: function (message, filename, exception) {
      var body = '<h1>Meadowlark Travel Site Error</h1>' +
        'message:<br><pre>' + message + '</pre><br>';
      if (exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
      if (filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
      mailTransport.sendMail({
        from: from,
        to: errorRecipient,
        subject: 'Meadowlark Travel Site Error',
        html: body,
        generateTextFromHtml: true
      }, function (err) {
        if (err) console.error('Unable to send email: ' + err);
      });
    },
  };
};