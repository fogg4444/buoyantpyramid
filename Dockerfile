FROM node:argon

<<<<<<< HEAD
ENV cachebust=840762987412734

RUN npm install gulp -g
RUN npm install bower -g

# Create app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

# Install app dependencies
COPY . /usr/src/app/
=======
RUN npm install gulp -g
RUN npm install bower -g

# Create app directory and copy files
COPY . /usr/src/app/
WORKDIR /usr/src/app
>>>>>>> 80b5ac4b818d7c46a735915ec48372dc2c83b197

RUN npm install
RUN cd client
RUN bower install --allow-root
RUN cd ..

RUN gulp build

EXPOSE 3000

CMD [ "node", "server/server.js" ]
