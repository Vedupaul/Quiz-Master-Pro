# ─────────────────────────────────────────────
# Quiz Master Pro — Dockerfile
# Serves the static app with nginx (alpine)
# ─────────────────────────────────────────────

# Use a minimal, production-ready nginx image
FROM nginx:alpine

# Remove the default nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy all static assets
COPY index.html  /usr/share/nginx/html/index.html
COPY styles.css  /usr/share/nginx/html/styles.css
COPY script.js   /usr/share/nginx/html/script.js

# Copy custom nginx config for SPA-friendly routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# nginx starts automatically as the container entrypoint
