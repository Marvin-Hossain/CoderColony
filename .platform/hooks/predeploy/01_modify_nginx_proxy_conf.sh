#!/bin/bash

# Define the target Nginx configuration file
# NOTE: This is the typical path on Amazon Linux 2 Docker platforms
NGINX_PROXY_CONF="/etc/nginx/conf.d/elasticbeanstalk/nginx-docker-proxy.conf"

# Define the header line we want to ensure is present
HEADER_LINE="proxy_set_header X-Forwarded-Proto https;"
# Define the incorrect header line we might need to replace
OLD_HEADER_LINE_PATTERN='proxy_set_header X-Forwarded-Proto \$scheme;'

echo "Attempting to modify Nginx proxy config: ${NGINX_PROXY_CONF}"

# Check if the file exists
if [ ! -f "${NGINX_PROXY_CONF}" ]; then
  echo "ERROR: Nginx proxy config file not found at ${NGINX_PROXY_CONF}. Cannot apply header fix." >&2
  # Exit successfully to avoid blocking deployment if path is wrong, but log clearly.
  exit 0
fi

# Check if the correct line already exists
if grep -qF "${HEADER_LINE}" "${NGINX_PROXY_CONF}"; then
  echo "Nginx proxy config already contains '${HEADER_LINE}'. No changes needed."
# Else, check if the incorrect line exists and replace it
elif grep -q "${OLD_HEADER_LINE_PATTERN}" "${NGINX_PROXY_CONF}"; then
  echo "Found existing X-Forwarded-Proto line with \$scheme. Replacing with 'https'."
  # Use sudo with sed -i for in-place editing
  sudo sed -i "s|${OLD_HEADER_LINE_PATTERN}|${HEADER_LINE}|g" "${NGINX_PROXY_CONF}"
  if [ $? -ne 0 ]; then
    echo "ERROR: Failed to replace X-Forwarded-Proto line using sed." >&2
    exit 1 # Fail deployment if sed fails
  fi
  echo "Replaced X-Forwarded-Proto line successfully."
else
  # If neither the correct nor the incorrect line is found, something is unexpected.
  # We won't attempt to add it automatically here as it's risky without knowing the exact structure.
  echo "WARNING: Could not find '${HEADER_LINE}' or '${OLD_HEADER_LINE_PATTERN}'. Header might not be set correctly by default EB config." >&2
fi

# After modifying (or confirming no modification needed), test Nginx configuration syntax
echo "Testing Nginx configuration syntax..."
sudo nginx -t
if [ $? -ne 0 ]; then
  echo "ERROR: Nginx configuration test failed! Check ${NGINX_PROXY_CONF}." >&2
  # Fail the deployment to prevent starting with bad Nginx config.
  exit 1
fi
echo "Nginx configuration test successful."

# No need to reload nginx here, EB will start/restart it after predeploy hooks.
exit 0
