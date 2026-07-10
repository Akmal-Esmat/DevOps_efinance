#!/bin/bash
set -e

echo "Applying Terraform..."
terraform init
terraform apply -auto-approve

RESOURCE_GROUP=$(terraform output -raw resource_group)
VM_NAME=$(terraform output -raw vm_name)

echo "Starting VM..."
az vm start \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME"

echo "VM is running."

IP=$(terraform output -raw public_ip)

echo
echo "Connect using:"
echo "ssh -i terraform_vm_key.pem akmal@$IP"