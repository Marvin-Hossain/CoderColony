#!/bin/bash
# Create a configuration snippet file that Nginx will include
# This file will reside in a location that is typically included by the main EB nginx config

CONFIG_SNIPPET="/etc/nginx/conf.d/elasticbeanstalk/01_custom_headers.conf"

echo "Creating Nginx custom headers snippet at ${CONFIG_SNIPPET}"

# Use sudo tee to write the file as root
sudo tee "${CONFIG_SNIPPET}" > /dev/null <<EOF
proxy_set_header X-Forwarded-Proto https;
proxy_set_header Host \$host;
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
EOF

# Check if the file was created successfully
if [ -f "${CONFIG_SNIPPET}" ]; then
  echo "Nginx custom headers snippet created successfully at ${CONFIG_SNIPPET}."
  # Explicitly reload Nginx to apply the new configuration
  echo "Attempting to reload Nginx configuration..."
  sudo service nginx reload
  RELOAD_STATUS=$? # Capture the exit status of the reload command
  if [ ${RELOAD_STATUS} -eq 0 ]; then
    echo "Nginx reloaded successfully."
  else
    echo "ERROR: Nginx reload failed with status ${RELOAD_STATUS}. The new headers might not be applied." >&2
    # Decide if this should be a fatal error for the deployment
    # exit 1 # Uncomment this to make deployment fail if reload fails
  fi
else
  echo "ERROR: Failed to create Nginx custom headers snippet at ${CONFIG_SNIPPET}" >&2
  exit 1
fi

exit 0
