FROM kmallea/csgo:latest

# Force download to include CSGO files in image
# RUN ${STEAMCMD_DIR}/steamcmd.sh +login anonymous +force_install_dir ${CSGO_DIR} +app_update ${CSGO_APP_ID} validate +quit

# Installer nodejs
ENV NODE_VERSION=lts

USER root

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

COPY ./ /agones-client

RUN cd /agones-client && npm install

USER steam

ENTRYPOINT node /agones-client/index.js
