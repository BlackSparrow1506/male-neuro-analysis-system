package com.maleneuro.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromName;
    private final String baseUrl;
    private final boolean mailEnabled;

    public MailService(JavaMailSender mailSender,
                       @Value("${app.mail.from:noreply@maleneuro.local}") String fromAddress,
                       @Value("${app.mail.from-name:Male Neural Network}") String fromName,
                       @Value("${app.base-url:http://localhost:8080}") String baseUrl,
                       @Value("${app.mail.enabled:true}") boolean mailEnabled) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
        this.baseUrl = baseUrl;
        this.mailEnabled = mailEnabled;
    }

    public void sendVerificationEmail(String to, String username, String token) {
        if (!mailEnabled) {
            log.warn("Mail disabled — skipping verification email to {}", to);
            return;
        }
        String link = baseUrl + "/api/auth/verify?token=" + token;
        String subject = "Verify your Male Neural Network account";
        String html = buildVerificationHtml(username, link);
        send(to, subject, html);
    }

    public void sendWelcomeEmail(String to, String username) {
        if (!mailEnabled) {
            log.warn("Mail disabled — skipping welcome email to {}", to);
            return;
        }
        String subject = "Welcome to Male Neural Network";
        String html = buildWelcomeHtml(username);
        send(to, subject, html);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Sent '{}' email to {}", subject, to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send mail to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildVerificationHtml(String username, String link) {
        return baseTemplate(
                "Verify Your Account",
                """
                <p style="margin:0 0 18px 0;color:#a8b2d1;font-size:15px;line-height:1.6;">
                  Hi <strong style="color:#00ccff;">%s</strong>,
                </p>
                <p style="margin:0 0 24px 0;color:#a8b2d1;font-size:15px;line-height:1.6;">
                  Welcome to the <strong style="color:#fff;">Male Neural Network</strong> — a private space for
                  exploring the architecture of your mind. To activate your account and secure your data,
                  please verify your email address by tapping the button below.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="%s"
                     style="display:inline-block;padding:16px 38px;
                            background:linear-gradient(135deg,#00ccff 0%%,#7c4dff 100%%);
                            color:#ffffff;text-decoration:none;font-weight:bold;
                            font-size:13px;letter-spacing:3px;text-transform:uppercase;
                            border-radius:12px;
                            box-shadow:0 8px 30px rgba(0,204,255,0.35);">
                    Verify My Account
                  </a>
                </div>
                <p style="margin:0 0 8px 0;color:#4a6080;font-size:11px;line-height:1.6;text-align:center;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0 0 28px 0;color:#7c4dff;font-size:11px;line-height:1.6;text-align:center;word-break:break-all;">
                  %s
                </p>
                <p style="margin:0;color:#4a6080;font-size:11px;line-height:1.6;">
                  This link will expire in <strong>24 hours</strong>. If you didn't create this account,
                  you can safely ignore this email — no account will be activated.
                </p>
                """.formatted(escape(username), link, link)
        );
    }

    private String buildWelcomeHtml(String username) {
        return baseTemplate(
                "Account Activated",
                """
                <p style="margin:0 0 18px 0;color:#a8b2d1;font-size:15px;line-height:1.6;">
                  Hi <strong style="color:#00ccff;">%s</strong>,
                </p>
                <p style="margin:0 0 18px 0;color:#a8b2d1;font-size:15px;line-height:1.6;">
                  Your account has been <strong style="color:#00e676;">successfully verified</strong>
                  and is now fully active. Welcome aboard.
                </p>
                <p style="margin:0 0 24px 0;color:#a8b2d1;font-size:15px;line-height:1.6;">
                  You can now sign in and start mapping your neural profile, chatting with the
                  intelligence layer, and watching your network evolve in real time.
                </p>
                <div style="margin:32px 0;padding:20px;background:rgba(0,204,255,0.04);
                            border:1px solid rgba(0,204,255,0.15);border-radius:12px;">
                  <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;
                              color:rgba(0,204,255,0.6);margin-bottom:8px;">
                    Security
                  </div>
                  <div style="color:#a8b2d1;font-size:13px;line-height:1.6;">
                    Passwords are stored with bcrypt hashing. Sessions use signed JWT tokens.
                    Your data stays private to your account.
                  </div>
                </div>
                <p style="margin:0;color:#4a6080;font-size:11px;line-height:1.6;">
                  If you didn't expect this email, please contact support immediately.
                </p>
                """.formatted(escape(username))
        );
    }

    private String baseTemplate(String headline, String body) {
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <title>%s</title>
        </head>
        <body style="margin:0;padding:0;background:#020610;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#020610;padding:40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
                       style="max-width:560px;width:100%%;background:rgba(6,10,26,0.96);
                              border:1px solid rgba(0,204,255,0.18);border-radius:20px;
                              box-shadow:0 0 80px rgba(0,204,255,0.06),0 40px 100px rgba(0,0,0,0.6);
                              overflow:hidden;">
                  <tr>
                    <td style="height:2px;background:linear-gradient(90deg,transparent,#00ccff,#7c4dff,#ff3366,transparent);"></td>
                  </tr>
                  <tr>
                    <td style="padding:44px 44px 12px 44px;text-align:center;">
                      <div style="font-size:11px;letter-spacing:5px;color:rgba(0,204,255,0.55);
                                  text-transform:uppercase;margin-bottom:12px;">
                        Neural Intelligence Platform
                      </div>
                      <div style="font-size:22px;font-weight:900;letter-spacing:3px;
                                  text-transform:uppercase;color:#ffffff;margin:0;">
                        Male Neural Network
                      </div>
                      <div style="margin-top:24px;font-size:13px;letter-spacing:2px;
                                  text-transform:uppercase;color:#7c4dff;">
                        %s
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 44px 44px 44px;">
                      %s
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 44px;background:rgba(0,0,0,0.35);
                               border-top:1px solid rgba(0,204,255,0.08);text-align:center;">
                      <div style="font-size:10px;letter-spacing:1.5px;color:#3a4a60;
                                  text-transform:uppercase;">
                        Male Neural Network &middot; Private &middot; Secure
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """.formatted(headline, headline, body);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
