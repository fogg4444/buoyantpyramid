FROM node:argon

RUN npm install gulp -g
RUN npm install bower -g

# Create app directory and copy files
COPY . /usr/src/app/
WORKDIR /usr/src/app

RUN npm install
RUN cd client
RUN bower install --allow-root
RUN cd ..

RUN gulp build

EXPOSE 3000

CMD [ "node", "server/server.js" ]
