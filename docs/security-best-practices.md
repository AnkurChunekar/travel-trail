### **Compromised Database**

- Use password hashing and salting to protect user passwords.
- Strongly encrypt password reset tokens.
- Implement user roles and permissions to control access to different parts of your application.
- Validate all user input before using it in your application.

### **Brute force attacks**

- Use bcrypt (to make login requests slow).
- Implement rate limiting (express-rate-limit)
- Implement maximum login attempts

### **Cross Site Scripting (XSS) Attacks**

- Sanitize user input data (DOMPurify)
- Store jwts in HTTPonly cookies
- set special HTTP headers (helmet package)

- Some headers found (not pointed while learning)
- Set the following security headers on all responses from your application:
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy (CSP)
  - X-XSS-Protection
  - X-Frame-Options
  - X-Content-Type-Options

### **Denial Of Service Attacks (DOS)**

- Implement rate limiting (express-rate-limit)
- Limit body payload (body-parser)
- Avoid Evil Regular Expressions

### **NOSQL Query Injection**

- Use Mongoose for MongoDB (strong schema types)
- Sanitize user input data

### **Other Best Practices**

- Always use HTTPS
- Create random password reset tokens with expiry dates
- Deny access to JWT after password change.
- Do not commit sensitive data to git/github
- Do not send error details to client
- Prevent Cross Site Request Forgery (csurf package)
- Require re-authentication before high-value action.
- Implement a blacklist of untrusted JWTs
- Confirm user email address after first creating the account
- Keep user logged in with refresh tokens.
- Implement 2 Factor Auth
- Prevent parameter pollution using uncaught expressions
