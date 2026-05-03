param(
    [string]$Message = ""
)

# ── 1. Require a commit message ───────────────────────────────────────────────
if (-not $Message) {
    $Message = Read-Host "Commit message"
    if (-not $Message) {
        Write-Host "Aborted: commit message is required." -ForegroundColor Red
        exit 1
    }
}

# ── 2. Stage all changes ──────────────────────────────────────────────────────
Write-Host "`n[1/3] Staging changes..." -ForegroundColor Cyan
git add .
if (-not $?) { Write-Host "git add failed." -ForegroundColor Red; exit 1 }

# ── 3. Commit ─────────────────────────────────────────────────────────────────
Write-Host "[2/3] Committing: $Message" -ForegroundColor Cyan
git commit -m $Message
if (-not $?) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
    # Still try to push in case there are already-committed changes to push
}

# ── 4. Push → triggers Netlify auto-deploy ────────────────────────────────────
Write-Host "[3/3] Pushing to origin/main (triggers Netlify deploy)..." -ForegroundColor Cyan
git push origin main
if ($?) {
    Write-Host "`nDone. Netlify will deploy automatically from main." -ForegroundColor Green
    Write-Host "Check status: https://app.netlify.com" -ForegroundColor DarkGray
} else {
    Write-Host "Push failed." -ForegroundColor Red
    exit 1
}
