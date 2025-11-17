const nodemailer = require('nodemailer');

async function enviarEmail(destinatario, assunto, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `"Suporte" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            html: html
        });

        console.log('E-mail enviado:', info.messageId);
        return true;
    } catch (erro) {
        console.error('Erro ao enviar e-mail:', erro);
        return false;
    }
}

module.exports = { enviarEmail };
