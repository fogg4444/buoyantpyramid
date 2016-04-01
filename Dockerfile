FROM node:argon

ENV cachebust=84062987412734

RUN npm install gulp -g
RUN npm install bower -g

# Create app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

# Install app dependencies
# COPY . /usr/src/app/
COPY ./package.json /usr/src/app/package.json
COPY ./bower.json /usr/src/app/bower.json

RUN npm install
# RUN cd client
RUN bower install --allow-root
# RUN cd ..

RUN gulp build

EXPOSE 3000

CMD ["npm", "start"]
