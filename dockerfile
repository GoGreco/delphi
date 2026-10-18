FROM nginx:alpine

COPY index.html main.css main.js /usr/share/nginx/html/

EXPOSE 80