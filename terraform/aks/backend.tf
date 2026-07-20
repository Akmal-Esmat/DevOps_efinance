terraform {
  backend "azurerm" {
    resource_group_name  = "devops-rg"
    storage_account_name = "akmaltfstate123"
    container_name       = "tfstate"
    key                  = "aks.tfstate"
  }
}