FROM node:18-alpine as builder
WORKDIR /app


FROM nginx:1.23.1-alpine as runtime
WORKDIR /app/nginx/html
RUN echo "server { listen 80; location / { root /app/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
RUN cat /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
