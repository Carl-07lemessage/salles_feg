#!/usr/bin/env node

// Charger variables d'environnement depuis .env
import 'dotenv/config'

/**
 * Utilitaire de test pour la configuration Nodemailer
 * Exécution: node test-email.mjs
 */

import nodemailer from 'nodemailer';

console.log('Test de configuration Nodemailer\n');

// Vérifier les variables d'environnement
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
  console.error('Assurez-vous que votre fichier .env contient EMAIL_USER et EMAIL_APP_PASSWORD\n');
  process.exit(1);
}

console.log('✅ Variables d\'environnement trouvées');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587'}\n`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true = 465, false = other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

console.log('🔗 Vérification de la connexion SMTP...\n');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de connexion SMTP:');
    console.error(error);
    console.log('\n💡 Conseils de dépannage:');
    console.log('   - Vérifiez que EMAIL_APP_PASSWORD est un mot de passe d\'application Gmail');
    console.log('   - Activez l\'authentification à deux facteurs sur votre compte Gmail');
    console.log('   - Vérifiez que SMTP_HOST=smtp.gmail.com et SMTP_PORT=587\n');
    process.exit(1);
  } else {
    console.log('✅ Connexion SMTP établie avec succès!\n');
    
    // Envoyer un email de test
    console.log('Envoi d\'un email de test...\n');
    
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '🧪 Email de Test - Configuration Nodemailer',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="background-color: #1a5f3f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1>✅ Test d'Email Réussi</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Bonjour,</p>
              <p>Cet email confirme que votre configuration <strong>Nodemailer</strong> fonctionne correctement!</p>
              <div style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #1a5f3f; border-radius: 4px; margin: 20px 0;">
                <strong>Informations de test:</strong><br/>
                <small>
                  Serveur SMTP: ${process.env.SMTP_HOST || 'smtp.gmail.com'}<br/>
                  Port: ${process.env.SMTP_PORT || '587'}<br/>
                  Utilisateur: ${process.env.EMAIL_USER}<br/>
                  Date: ${new Date().toLocaleString('fr-FR')}
                </small>
              </div>
              <p>Vous pouvez maintenant utiliser les fonctions d'envoi d'emails dans l'application:</p>
              <ul>
                <li><code>sendCustomerConfirmationEmail()</code> - Confirmation client</li>
                <li><code>sendAdminNotificationEmail()</code> - Notification admin</li>
                <li><code>sendCancellationEmail()</code> - Annulation de réservation</li>
              </ul>
              <hr/>
              <p style="color: #666; font-size: 12px;">
                Cet email a été envoyé par le système de test Nodemailer.
              </p>
            </div>
          </body>
        </html>
      `,
      text: 'Test Email - Votre configuration Nodemailer fonctionne correctement!'
    };

    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:');
        console.error(error);
        process.exit(1);
      } else {
        console.log('✅ Email envoyé avec succès!');
        console.log(`   Réponse serveur: ${info.response}`);
        console.log(`   Message ID: ${info.messageId}\n`);
        console.log('✨ Votre configuration Nodemailer est complètement fonctionnelle!');
        console.log('   Vous pouvez maintenant utiliser les fonctions d\'envoi d\'emails.\n');
        process.exit(0);
      }
    });
  }
});

// Timeout de sécurité
setTimeout(() => {
  console.error('\n⏱️ Timeout: la connexion SMTP prend trop de temps');
  console.error('Vérifiez votre connexion réseau et la configuration SMTP\n');
  process.exit(1);
}, 30000);
