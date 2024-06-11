# Base image
FROM coturn/coturn:latest

# Maintainer
LABEL maintainer="your_email@example.com"

# Copy the configuration file
COPY turnserver.conf /etc/turnserver.conf

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Expose necessary ports
EXPOSE 3478 5349 3478/udp

# Use CMD to run the entrypoint script
CMD ["/bin/bash", "/usr/local/bin/entrypoint.sh"]
