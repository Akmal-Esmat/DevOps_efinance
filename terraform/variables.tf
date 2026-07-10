variable "subscription_id" {
  type = string
}

variable "location" {
  default = "UAE North"
}

variable "resource_group_name" {
  default = "terraform-rg"
}

variable "vm_name" {
  default = "terraform-vm"
}

variable "vm_size" {
  default = "Standard_B2ats_v2"
}

variable "admin_username" {
  default = "akmal"
}