# Lightweight nginx image for serving static files
FROM nginx:1.27-alpine

# Remove default nginx config and site
RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static site files
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY data.js /usr/share/nginx/html/
COPY firebase-config.js /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY tests.js /usr/share/nginx/html/
COPY tests.html /usr/share/nginx/html/

# Cloud Run uses PORT env variable (default 8080)
EXPOSE 8080

# Start nginx in foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
