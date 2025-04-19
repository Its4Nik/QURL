FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/

RUN cd /temp/dev && \
    bun install --frozen-lockfile --production

FROM base AS release
WORKDIR /QURL
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]
