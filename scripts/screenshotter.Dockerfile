FROM alpine:3.20

RUN apk add --no-cache \
    chromium \
    font-noto \
    font-noto-extra \
    font-noto-arabic \
    font-dejavu \
    ca-certificates

WORKDIR /work
ENTRYPOINT ["chromium", "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars"]
