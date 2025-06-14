import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Konfigurasi SMTP transporter
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // atau SMTP provider lain
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.error('Error creating email transporter:', error);
      this.transporter = null;
    }
  }

  // Fungsi: Verifikasi konfigurasi email
  async verifyConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Email transporter not initialized' };
    }

    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Fungsi: Mengirim email reset password ke user
  async sendResetPasswordEmail(email, username, resetToken) {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${username},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return { success: false, error: error.message };
    }
  }
  // Fungsi: Mengirim konfirmasi setelah password berhasil direset
  async sendPasswordResetConfirmation(email, username) {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Password Reset Successful</h2>
          <p>Hello ${username},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset confirmation:', error);
      return { success: false, error: error.message };
    }
  }
  // Fungsi: Mengirim konfirmasi setelah password berhasil diubah
  async sendPasswordChangeConfirmation(email, username) {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Password Changed Successfully</h2>
          <p>Hello ${username},</p>
          <p>Your account password has been successfully changed.</p>
          <p><strong>Security Notice:</strong></p>
          <ul>
            <li>If you made this change, no further action is required.</li>
            <li>If you did NOT make this change, please contact our support team immediately.</li>
          </ul>
          <p>Change was made on: <strong>${new Date().toLocaleString()}</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
