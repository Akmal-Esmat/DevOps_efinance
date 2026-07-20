variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "AKS Resource Group"
  type        = string
}

variable "location" {
  description = "Azure Region"
  type        = string
}

variable "aks_name" {
  description = "AKS Cluster Name"
  type        = string
}

variable "acr_name" {
  description = "Azure Container Registry Name"
  type        = string
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 1
}

variable "node_vm_size" {
  description = "Worker node VM size"
  type        = string
  default     = "Standard_B2s"
}