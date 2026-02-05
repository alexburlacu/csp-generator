import { chromium } from 'playwright';

interface CSPData {
    'script-src': Set<string>;
    'style-src': Set<string>;
    'img-src': Set<string>;
    'font-src': Set<string>;
    'connect-src': Set<string>;
    'media-src': Set<string>;
    'frame-src': Set<string>;
    'object-src': Set<string>;
    'default-src': Set<string>;
}

export async function generateCSP(url: string, useWildcards: boolean = true): Promise<string> {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const cspData: CSPData = {
        'script-src': new Set(),
        'style-src': new Set(),
        'img-src': new Set(),
        'font-src': new Set(),
        'connect-src': new Set(),
        'media-src': new Set(),
        'frame-src': new Set(),
        'object-src': new Set(),
        'default-src': new Set(["'self'"]),
    };

    // List of domains that should use wildcards for subdomains
    const wildcardDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'googleapis.com',
        'gstatic.com',
        'statcounter.com',
        'cloudflare.com',
        'cloudfront.net',
        'amazonaws.com',
        'akamaized.net',
        'fastly.net',
        'cdn77.org',
        'jsdelivr.net',
        'unpkg.com',
        'bootstrapcdn.com',
        'fontawesome.com',
        'fonts.gstatic.com',
        'doubleclick.net',
        'facebook.net',
        'fbcdn.net',
        'twitter.com',
        'twimg.com',
    ];

    // Get the base origin of the URL being crawled
    let baseUrlOrigin = '';
    try {
        baseUrlOrigin = new URL(url).origin;
    } catch (e) {
        // Fallback or leave empty
    }

    // Helper to extract origin or wildcard domain
    const getOrigin = (resUrl: string) => {
        try {
            const u = new URL(resUrl);
            const hostname = u.hostname;

            // Check if this is a same-origin request
            if (u.origin === baseUrlOrigin) {
                return "'self'";
            }

            // Check if this domain should use a wildcard (only if useWildcards is enabled)
            if (useWildcards) {
                for (const wildcardDomain of wildcardDomains) {
                    if (hostname.endsWith(wildcardDomain)) {
                        // If it's already the base domain, use it as-is
                        if (hostname === wildcardDomain) {
                            return `${u.protocol}//${hostname}`;
                        }
                        // Otherwise, use wildcard for subdomains
                        return `${u.protocol}//*.${wildcardDomain}`;
                    }
                }
            }

            // Default: return the full origin
            return u.origin;
        } catch (e) {
            return null;
        }
    };

    page.on('request', request => {
        const type = request.resourceType();
        const reqUrl = request.url();
        const origin = getOrigin(reqUrl);

        if (!origin) return;

        // Skip data URIs except maybe for images if we want to allow data:
        if (reqUrl.startsWith('data:')) {
            if (type === 'image') cspData['img-src'].add('data:');
            return;
        }

        switch (type) {
            case 'script':
                cspData['script-src'].add(origin);
                break;
            case 'stylesheet':
                cspData['style-src'].add(origin);
                break;
            case 'image':
                cspData['img-src'].add(origin);
                break;
            case 'font':
                cspData['font-src'].add(origin);
                break;
            case 'xhr':
            case 'fetch':
                cspData['connect-src'].add(origin);
                break;
            case 'media':
                cspData['media-src'].add(origin);
                break;
            case 'document':
            case 'frame':
            case 'iframe':
                if (origin !== "'self'") { // Don't add the main page itself to frame-src unless it's an iframe from another source
                    cspData['frame-src'].add(origin);
                }
                break;
            case 'other':
            default:
                break;
        }
    });

    try {
        console.log(`Attempting to load: ${url}`);

        // Try with networkidle first
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (firstError: any) {
            console.log(`networkidle failed, trying with domcontentloaded: ${firstError.message}`);

            // Fallback: try with domcontentloaded
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                // Wait a bit for resources to load
                await page.waitForTimeout(3000);
            } catch (secondError: any) {
                console.log(`domcontentloaded failed, trying with load: ${secondError.message}`);

                // Last fallback: try with load
                await page.goto(url, { waitUntil: 'load', timeout: 30000 });
                await page.waitForTimeout(2000);
            }
        }

        console.log(`Successfully loaded: ${url}`);
    } catch (e: any) {
        console.error(`Error visiting page ${url}:`, e.message);
        throw new Error(`Failed to load ${url}: ${e.message}`);
    } finally {
        await browser.close();
    }

    // Construct CSP String with deduplication
    const directives = Object.keys(cspData) as Array<keyof CSPData>;
    let cspString = '';

    directives.forEach(directive => {
        if (cspData[directive].size > 0) {
            // Ensure 'self' is present in all populated directives (except default-src which already has it)
            // This prevents the directive from overriding default-src 'self' and blocking same-origin resources.
            if (directive !== 'default-src' && !cspData[directive].has("'self'")) {
                cspData[directive].add("'self'");
            }

            const sources = Array.from(cspData[directive]);

            // Deduplicate: if we have both wildcard and specific subdomain, keep only wildcard
            const deduplicated = sources.filter((source, index, arr) => {
                // Keep 'self', 'data:', etc.
                if (source.startsWith("'") || !source.startsWith('http')) {
                    return true;
                }

                // If this is a wildcard domain
                if (source.includes('//*.')) {
                    return true;
                }

                // Check if there's a wildcard version of this domain
                try {
                    const sourceUrl = new URL(source);
                    const wildcardVersion = `${sourceUrl.protocol}//*.${sourceUrl.hostname}`;

                    // If wildcard version exists in the array, skip this specific one
                    if (arr.includes(wildcardVersion)) {
                        return false;
                    }

                    // Also deduplicate the base origin if it matches the base URL origin (should already be handled by 'self')
                    if (source === baseUrlOrigin) {
                        return false;
                    }
                } catch (e) {
                    return true;
                }

                return true;
            });

            // Sort sources for consistent output, putting special values first
            const sorted = deduplicated.sort((a, b) => {
                if (a.startsWith("'") && !b.startsWith("'")) return -1;
                if (!a.startsWith("'") && b.startsWith("'")) return 1;
                return a.localeCompare(b);
            });

            cspString += `${directive} ${sorted.join(' ')}; `;
        }
    });

    return cspString.trim();
}
