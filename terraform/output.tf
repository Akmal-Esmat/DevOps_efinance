output "public_ip" {
  value = azurerm_public_ip.public_ip.ip_address
}

output "resource_group" {
  value = azurerm_resource_group.rg.name
}

output "vm_name" {
  value = azurerm_linux_virtual_machine.vm.name
}

output "ssh_command" {
  value = "ssh -i terraform_vm_key.pem ${var.admin_username}@${azurerm_public_ip.public_ip.ip_address}"
}