# Force remove existing .git folder if it exists
if (Test-Path .git) {
    Remove-Item -Path .git -Recurse -Force
    Write-Host "Removed existing .git directory."
}

# Initialize new repo
git init
Write-Host "Initialized new git repository."

# Add all files
git add .
Write-Host "Added all files to staging."

# Commit (using a default identity for this setup if not configured)
git config user.email "admin@binaryelite.com"
git config user.name "Binary Elite Setup"
git commit -m "Initial commit: Binary Elite Dashboard"
Write-Host "Created initial commit."

# Rename branch to main
git branch -M main

# Add remote
git remote add origin https://github.com/vinnie-ps/The-Binary-Elite.git
Write-Host "Added remote origin."

Write-Host "---------------------------------------------------"
Write-Host "SETUP COMPLETE! Run this command to push your code:"
Write-Host "git push -u origin main --force"
Write-Host "---------------------------------------------------"
