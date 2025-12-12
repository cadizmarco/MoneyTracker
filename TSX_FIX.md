# Quick Fix for tsx Error

## The Problem

The `all` package (version 0.0.0) in dependencies may have install hooks that try to run `tsx`.

## Solution

Removed the `all` dependency from:
- `backend/package.json`
- Root `package.json`

This dependency was unnecessary and potentially causing the tsx command error during Vercel builds.

## Next Steps

1. Commit and push:
```bash
git add .
git commit -m "Remove suspicious 'all' dependency causing tsx error"
git push origin main
```

2. Vercel will auto-redeploy

## If This Doesn't Fix It

The issue may be coming from nodemon being triggered. Alternative solution would be to ensure build command doesn't trigger dev dependencies at all.
