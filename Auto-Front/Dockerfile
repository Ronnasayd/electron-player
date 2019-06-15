FROM node
RUN set -ex && apt-get update && \
    yarn global add --no-bin-links gulp-cli && \
    yarn global add --no-bin-links browser-sync
USER node
WORKDIR /app
CMD yarn --no-bin-links && gulp
