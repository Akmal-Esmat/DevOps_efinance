#!/bin/bash
set -e

RESOURCE_GROUP=$(terraform output -raw resource_group)
VM_NAME=$(terraform output -raw vm_name)

az vm deallocate --resource-group "$RESOURCE_GROUP" --name "$VM_NAME"

echo "VM stopped."