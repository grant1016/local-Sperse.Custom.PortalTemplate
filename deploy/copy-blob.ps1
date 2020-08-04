[CmdletBinding()]
param
(
    [string] [Parameter(Mandatory = $true)]
    $StorageName,
    
    [string] [Parameter(Mandatory = $true)]
    $StorageKey,
    
    [string] [Parameter(Mandatory = $true)]
    $ContainerName,
    
    [string] [Parameter(Mandatory = $true)]
    $SrcBlob,
    
    [string] [Parameter(Mandatory = $true)]
    $DestBlob
)

try 
{
    Write-Host "Getting context for '$StorageName' storage ..."
    $StorageContext = New-AzureStorageContext -StorageAccountName $StorageName -StorageAccountKey $StorageKey
    
    Write-Host "Checking container '$ContainerName' exists ..."
    $Container = Get-AzureStorageContainer -Context $StorageContext -ErrorAction Stop | where-object {$_.Name -eq $ContainerName}
     
    Write-Host "Copying blob '$SrcBlob' to '$DestBlob' ..."
    Start-AzureStorageBlobCopy -Context $StorageContext -SrcContainer $ContainerName -DestContainer $ContainerName -SrcBlob $SrcBlob -DestBlob $DestBlob -Force
    
    Write-Host "Done"
}
catch 
{
    Write-Host $_.Exception.ToString()
    throw
}