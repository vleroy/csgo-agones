FROM ghcr.io/vleroy/docker-csgo:master

# Installer nodejs
ENV NODE_VERSION=lts

USER root

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

COPY ./ /agones-client

USER steam

ENTRYPOINT node /agones-client/index.js
