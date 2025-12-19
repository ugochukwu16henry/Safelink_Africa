# Security Guidelines

## Encryption

- All sensitive data encrypted at rest (AES-256)
- End-to-end encryption for messages
- TLS/SSL for all API communications

## Authentication

- JWT tokens with expiration
- Refresh token rotation
- Rate limiting on auth endpoints
- OTP verification for phone numbers

## Data Protection

- GDPR compliance
- User data anonymization options
- Secure data deletion
- Regular security audits

## API Security

- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

## Mobile Security

- Certificate pinning
- Secure storage (Keychain/Keystore)
- Root/jailbreak detection
- App integrity checks

## Reporting Security Issues

Report security vulnerabilities to: security@safelinkafrica.com

Do not open public GitHub issues for security vulnerabilities.

