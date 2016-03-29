# Compile ffmpeg from source on centos 7

# ffmpeg-nodejs
#
# FFMPEG-VERSION               2.8.1-1
# NODEJS-VERSION               4.2.2
# VERSION               
#
# From https://trac.ffmpeg.org/wiki/CompilationGuide/Centos
# From https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
#
#

<<<<<<< HEAD
# FROM          centos7 ??
# MAINTAINER    Raman Nanda <Raman148@gmail.com>

=======
# FROM          fogg4444/centosffmpeg
# MAINTAINER    Raman Nanda <Raman148@gmail.com>


>>>>>>> 80b5ac4b818d7c46a735915ec48372dc2c83b197
# ENV           FFMPEG_VERSION=2.8.1 \
#               MPLAYER_VERSION=1.2  \
#              YASM_VERSION=1.3.0   \
#              OGG_VERSION=1.3.2    \
#              VORBIS_VERSION=1.3.5 \
#              THEORA_VERSION=1.1.1 \
#              LAME_VERSION=3.99.5  \
#              OPUS_VERSION=1.1     \
#              FAAC_VERSION=1.28    \
#              VPX_VERSION=1.4.0    \
#              XVID_VERSION=1.3.4   \
#              FDKAAC_VERSION=0.1.4 \
#              X265_VERSION=1.8     \
#              NODEJS_VERSION=4.2.2 

# COPY          run.sh /tmp/run.sh

# See https://github.com/Raman148/ffmpeg-nodejs/blob/master/run.sh
# RUN           bash /tmp/run.sh

# Let's make sure the app built correctly
# RUN           ffmpeg -buildconf

# Make sure Node.js is installed
# RUN           node -v
# RUN           npm -v

<<<<<<< HEAD
#################################################################################################################
# Build from ffmpeg install

FROM fogg4444/centosffmpeg

ENV cachebust = 1489884445
=======

#################################################################################################################
# Build from ffmpeg install

FROM centosffmpeg

ENV cachebust = 148445

RUN ls
>>>>>>> 80b5ac4b818d7c46a735915ec48372dc2c83b197

# Create app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

<<<<<<< HEAD
# Install app dependencies
COPY . /usr/src/app/

=======
RUN ls

# Install app dependencies
COPY . /usr/src/app/

RUN ls
RUN cat package.json

>>>>>>> 80b5ac4b818d7c46a735915ec48372dc2c83b197
RUN npm install


EXPOSE 4000

<<<<<<< HEAD
CMD ["node", "bin/www"]

=======
CMD ["node", "./bin/www"]
>>>>>>> 80b5ac4b818d7c46a735915ec48372dc2c83b197
