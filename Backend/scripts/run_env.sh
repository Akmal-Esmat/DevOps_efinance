cd ../
docker rm -f ef-backend-dev || echo "Container ef-backend-dev does not exist, proceeding to create it"
docker run --name ef-backend-dev -v $PWD/.env:/app/.env -p 8000:8000 ef-backend:1.0
