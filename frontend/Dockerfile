FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html

COPY env-config.template.js /usr/share/nginx/html/env-config.template.js

CMD /bin/sh -c "envsubst < /usr/share/nginx/html/env-config.template.js > /usr/share/nginx/html/env-config.js && nginx -g 'daemon off;'"
