package main

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	// Carregar .env
	godotenv.Load()

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USERNAME")
	smtpPass := os.Getenv("SMTP_PASSWORD")
	fromEmail := os.Getenv("SES_FROM_EMAIL")

	if smtpHost == "" || smtpUser == "" || smtpPass == "" || fromEmail == "" {
		fmt.Println("❌ Erro: Variáveis SMTP não configuradas no .env")
		fmt.Println("\nConfigure:")
		fmt.Println("  SMTP_HOST=email-smtp.us-east-1.amazonaws.com")
		fmt.Println("  SMTP_PORT=587")
		fmt.Println("  SMTP_USERNAME=seu-username")
		fmt.Println("  SMTP_PASSWORD=sua-password")
		fmt.Println("  SES_FROM_EMAIL=noreply@piercloud.com")
		return
	}

	// Email de teste
	fmt.Print("Digite o email de destino para teste: ")
	var toEmail string
	fmt.Scanln(&toEmail)

	if toEmail == "" {
		fmt.Println("❌ Email inválido")
		return
	}

	fmt.Println("\n🔄 Enviando email de teste...")
	fmt.Printf("   De: %s\n", fromEmail)
	fmt.Printf("   Para: %s\n", toEmail)
	fmt.Printf("   SMTP: %s:%s\n\n", smtpHost, smtpPort)

	subject := "Test Email - PierCloud Status Page"
	htmlBody := fmt.Sprintf(`<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
		<h2 style="color: #2563eb;">✅ Email Test Successful!</h2>
		<p>This is a test email from PierCloud Status Page.</p>
		<p><strong>Sent at:</strong> %s</p>
		<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
		<p style="color: #666; font-size: 12px;">
			If you received this email, your AWS SES SMTP configuration is working correctly.
		</p>
	</div>
</body>
</html>`, time.Now().Format("02/01/2006 15:04:05"))

	msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		fromEmail, toEmail, subject, htmlBody))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	tlsConfig := &tls.Config{ServerName: smtpHost}

	conn, err := tls.Dial("tcp", smtpHost+":"+smtpPort, tlsConfig)
	if err != nil {
		fmt.Printf("❌ Erro ao conectar: %v\n", err)
		return
	}

	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		fmt.Printf("❌ Erro ao criar cliente: %v\n", err)
		conn.Close()
		return
	}

	if err = client.Auth(auth); err != nil {
		fmt.Printf("❌ Erro de autenticação: %v\n", err)
		fmt.Println("\n💡 Verifique:")
		fmt.Println("   - SMTP_USERNAME está correto")
		fmt.Println("   - SMTP_PASSWORD está correto")
		client.Close()
		return
	}

	if err = client.Mail(fromEmail); err != nil {
		fmt.Printf("❌ Erro no remetente: %v\n", err)
		fmt.Println("\n💡 Verifique:")
		fmt.Println("   - SES_FROM_EMAIL está verificado no AWS SES")
		client.Close()
		return
	}

	if err = client.Rcpt(toEmail); err != nil {
		fmt.Printf("❌ Erro no destinatário: %v\n", err)
		fmt.Println("\n💡 Se estiver em Sandbox Mode:")
		fmt.Println("   - O email de destino precisa estar verificado no AWS SES")
		client.Close()
		return
	}

	w, err := client.Data()
	if err != nil {
		fmt.Printf("❌ Erro ao enviar dados: %v\n", err)
		client.Close()
		return
	}

	_, err = w.Write(msg)
	if err != nil {
		fmt.Printf("❌ Erro ao escrever mensagem: %v\n", err)
		w.Close()
		client.Close()
		return
	}

	w.Close()
	client.Quit()

	fmt.Println("✅ Email enviado com sucesso!")
	fmt.Println("\n📧 Verifique sua caixa de entrada (e spam)")
}
