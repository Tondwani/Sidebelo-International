FROM alpine:latest

# Install dependencies needed for PocketBase execution
RUN apk add --no-cache ca-certificates curl unzip

# Download and set up PocketBase Linux binary matching your local version
ARG PB_VERSION=0.39.11
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -o pb.zip \
    && unzip pb.zip \
    && rm pb.zip

EXPOSE 8090

# Start PocketBase, binding to all interfaces and pointing data storage to the persistent mount path
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]