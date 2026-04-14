const nodemailer = require('nodemailer');

const enviarEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true para puerto 465, false para 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transporter.sendMail({
        from: `"Soporte" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

module.exports = enviarEmail;
