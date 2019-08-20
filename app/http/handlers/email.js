var sgMail = require("@sendgrid/mail");

/**
 * Send email to verify email
 * @param email
 * @param token
 * @returns {Promise}
 */
exports.sendEmailAuthenticationEmail = async (email, token) => {
  try {

    await sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    var msg = {
      to: email,
      from: "support@freshi-blog.herokuapp.com",
      subject: "no-reply-please-verify-email",
      content: [
        {
          type: 'text/plain',
          value: `Click on this link to verify your email ${process.env.APP_BASE_URL}/v1/auth/verify/${email}/${token}`
        },
      ]
    };

    await sgMail.send(msg);

  } catch (error) {
    error.message = "Failed to send email";
    error.statusCode = 500;
    throw error;
  }
};
