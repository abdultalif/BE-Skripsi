import nodemailer from "nodemailer";
import dotenv from "dotenv/config";

const baseUrl = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const createEmail = (name, email, token) => {
    return {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Pizza21: Verify Your Email",
        html:
            `
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%;background-color:#f6f6f6" width="100%" bgcolor="#f6f6f6">
                <tbody>
                    <tr>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top;Margin:0 auto!important;max-width:580px;padding:10px;width:580px" width="580" valign="top">
                            <div style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px">
                                <span style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;width:0">Verify Your Email</span>
                                <table style="border-collapse:separate;width:100%;background:#fff;border-radius:3px" width="100%">
                                    <tbody>
                                        <tr>
                                            <td style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px" valign="top">
                                                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Hi ${name},</p>
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Thanks for signing up for Pizza21!  We want to make sure that we got your email right.</p>
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Please verify your email by clicking the link below:</p>
                                                                <p><a style="color:#0079f2;text-decoration:none;font-weight:bold" href="${baseUrl}/api-public/users/activate/${email}/${token}" target="_blank">Verify Now</a></p>
                                                                <p>If you can't click on the link, copy and paste the following URL into a new tab in your browser:</p>
                                                                <p><a href="${baseUrl}/api-public/users/activate/${email}/${token}" target="_blank">${baseUrl}/api-public/users/activate/${email}/${token}</a></p>
                                                                <p>Happy coding!</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                        </td>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        `
    };
};

const sendMail = (name, email, token) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(createEmail(name, email, token), (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Email sent: ${info.response}`);
                resolve(true);
            }
        });
    });
};

export {
    sendMail
};