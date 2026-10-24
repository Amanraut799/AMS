# Free demo deployment: Render + Aiven

This setup keeps the current React, Spring Boot, and MySQL stack and targets a demo rather than production. Render serves the frontend and API; Aiven supplies hosted MySQL. Both offer free tiers. Render requires the source in a GitHub repository for Blueprint deployment, so the project must first be pushed to a private GitHub repository and connected to Render.

## Free-tier tradeoffs

- Render free web services spin down after 15 minutes without requests and take about a minute to wake. The API may feel slow on the first demo request after idle.
- Aiven Free MySQL includes 1 GB storage and 1 GB RAM. Aiven may power off a free service after an extended period of inactivity; check its console/email and start it again if needed.
- Render free services cannot send outbound SMTP over ports 25, 465, or 587. Password-reset email through Gmail SMTP will not work on this free host. Set `RESEND_API_KEY` on the API service to send reset emails through Resend's HTTPS API. Set `MAIL_FROM` to a sender address verified with that provider and keep `APP_PASSWORD_RESET_URL` pointed at the deployed frontend reset-password page. Paid hosting can continue using the `MAIL_*` SMTP settings.
- Use demo-only employee records. This free setup is not suitable for live company attendance or borrower data.

## Deploy steps

1. Create a private GitHub repository and push this project to it. Do not commit `.env` files or real credentials.
2. Create a free Aiven MySQL service. From its connection details, use the host, port, username, password, and database name. Aiven provides a TLS-enabled JDBC connection string; use the URL form `jdbc:mysql://HOST:PORT/DATABASE?sslmode=require&serverTimezone=Asia/Kolkata`.
3. In Render, choose **New → Blueprint**, connect the GitHub repository, and use the root `render.yaml`. It defines a free Singapore API service and a free static frontend. The API builds from `attendance-backend/Dockerfile`.
4. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` on the API service from Aiven's connection details. Render generates `JWT_SECRET` automatically.
5. After Render generates the API's public HTTPS URL, set `VITE_API_BASE_URL` on the frontend service to `https://YOUR-API.onrender.com/api` and redeploy the frontend.
6. Set `APP_CORS_ALLOWED_ORIGINS` on the API to the exact frontend origin, such as `https://YOUR-FRONTEND.onrender.com`. Set `APP_PASSWORD_RESET_URL` to that origin plus `/reset-password`, then redeploy the API.
7. Add demo employee/admin accounts and approved work areas, then check login, GPS attendance, leaves, monthly sheet, and Excel export from the deployed URL.

## Build checks

Frontend: from `frontend/`, run `npm ci` then `npm run build`.

Backend: from `attendance-backend/`, run `./mvnw.cmd package -DskipTests` on Windows. Render builds the backend image from its Dockerfile.

Browser GPS requires HTTPS; Render provides HTTPS for its service domains. React Router paths are rewritten to `index.html` by the static-site rule in `render.yaml`.

## Production hardening

Before production, use paid persistent compute and a production database plan, manage schema changes with migrations instead of Hibernate `update`, verify database TLS, use email delivery through a supported HTTPS provider, configure backups and monitoring, and use a restricted database account. Rotate any credential that has ever been committed or shared.
