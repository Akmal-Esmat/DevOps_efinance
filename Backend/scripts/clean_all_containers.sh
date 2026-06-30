container_count=$(docker ps -a |grep -v CONTAINER |wc -l)
echo "You have $container_count containers running"
echo "Deleting containers..."
for container in $(docker ps -a | awk '{print $1}' |grep -v CONTAINER); do
	echo "Deleting container $container"
	docker rm -f $container
done
container_count=$(docker ps -a |grep -v CONTAINER |wc -l)
echo "You now have $container_count containers running"
