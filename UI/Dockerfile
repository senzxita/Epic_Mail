FROM nginx:latest

ADD ./js/index.js /usr/share/nginx/html/index.js

RUN chmod +r /usr/share/nginx/html/index.js



EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
