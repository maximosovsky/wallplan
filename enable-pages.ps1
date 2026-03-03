$body = @{
    build_type = "legacy"
    source     = @{
        branch = "main"
        path   = "/"
    }
} | ConvertTo-Json -Compress

$body | gh api repos/maximosovsky/wallplan/pages -X POST --input -
