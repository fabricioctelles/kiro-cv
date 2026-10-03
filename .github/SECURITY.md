# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue
- Post about it on social media
- Exploit the vulnerability

### Do

1. **Email us directly** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

2. **Allow time for response** - We aim to respond within 48 hours

3. **Coordinate disclosure** - Please give us reasonable time to fix the issue before public disclosure

## What to Report

- Authentication/authorization bypasses
- Data exposure vulnerabilities
- Injection vulnerabilities (XSS, SQL injection, etc.)
- Rate limiting bypasses
- AI prompt injection that bypasses guardrails

## What NOT to Report

- Clickjacking on pages with no sensitive actions
- Missing security headers that don't lead to exploitable vulnerabilities
- Vulnerabilities in dependencies without a working proof of concept
- Self-XSS (requires user to paste code in console)

## Recognition

We appreciate security researchers who help keep our project safe. With your permission, we'll acknowledge your contribution in our release notes.

## Scope

This security policy applies to:

- The main Kiro CV application
- The AI chat endpoint (`/api/chat`)
- Configuration files that could expose sensitive data

Out of scope:

- Third-party services and APIs
- User-customized deployments
