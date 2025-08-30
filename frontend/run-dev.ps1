# Run Next.js development server with explicit path resolution
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Clear Next.js cache
if (Test-Path .next/cache) {
    Remove-Item -Recurse -Force .next/cache
}

# Run the development server
npm run dev -- --no-cache
