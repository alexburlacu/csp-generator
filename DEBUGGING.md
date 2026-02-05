# Debugging Guide

## Viewing Logs

### Server Logs
The server terminal will now show detailed logs:
- `[timestamp] Generating CSP for: <url>` - When a request starts
- `Attempting to load: <url>` - When Playwright starts loading the page
- `networkidle failed, trying with domcontentloaded` - If the first strategy fails
- `Successfully loaded: <url>` - When the page loads successfully
- `[timestamp] Successfully generated CSP for: <url>` - When CSP is generated
- `[timestamp] Error generating CSP for <url>:` - If an error occurs

### Client Logs
The browser console (F12 → Console tab) will show any client-side errors.

## Common Errors

### HTTP/2 Protocol Error
**Error:** `ERR_HTTP2_PROTOCOL_ERROR`

**Cause:** The website has HTTP/2 configuration issues or uses advanced security features that block headless browsers.

**Solutions:**
1. The app now automatically retries with different loading strategies
2. Some sites may still fail - this is a limitation of the site, not the tool
3. Try a different page on the same domain

### Timeout Errors
**Error:** `Request Timeout`

**Cause:** The page took too long to load (>30 seconds).

**Solutions:**
1. The site may be slow or temporarily down
2. Try again later
3. Check if the site loads in your regular browser

### Domain Not Found
**Error:** `Domain Not Found` or `ERR_NAME_NOT_RESOLVED`

**Cause:** The domain doesn't exist or can't be resolved.

**Solutions:**
1. Check the URL for typos
2. Make sure you include `https://` or `http://`
3. Verify the domain exists

## Testing the Error Display

1. **Open the browser console** (F12 → Console tab)
2. **Try a problematic URL** (like one that gave HTTP/2 errors)
3. **Check both:**
   - Server terminal for detailed logs
   - UI error message for user-friendly description
   - Browser console for any client-side issues

## Successful Test URLs

These URLs typically work well:
- `https://example.com` - Simple test site
- `https://github.com` - Complex modern site
- `https://www.google.com` - Heavy JavaScript site

## Server Restart

If you make changes to server code, nodemon should auto-restart. If it doesn't:
```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

## Checking What Was Captured

Even if a site partially fails, you can check the server logs to see what resources were captured before the error occurred.
