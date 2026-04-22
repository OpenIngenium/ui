# Set host.docker.internal is used for containers to access service on host
# This is only available for Docker for Mac and Docker for Windows.
# Set a fake host id for Linux host.
# See https://dev.to/bufferings/access-host-from-a-docker-container-4099
HOST_DOMAIN="host.docker.internal"
ping -q -c1 $HOST_DOMAIN > /dev/null 2>&1
if [ $? -ne 0 ]; then
  HOST_IP=$(ip route | awk 'NR==1 {print $3}')
  echo -e "$HOST_IP\t$HOST_DOMAIN" >> /etc/hosts
fi