import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_password_reset_email(to_email: str, reset_token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    subject = "Reset your AI Traffic Analyzer password"
    body = f"""\
Hi,

We received a request to reset your AI Traffic Analyzer password.

Click the link below to set a new password. This link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes:

{reset_link}

If you didn't request this, you can safely ignore this email -- your password won't be changed.

-- AI Traffic Analyzer
"""

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
