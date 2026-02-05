import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generateCSP } from './crawler';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate-csp', async (req, res) => {
    const { url, useWildcards = true } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Normalize URL - add https:// if no protocol specified
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validate URL format
    try {
        new URL(normalizedUrl);
    } catch (e) {
        return res.status(400).json({
            error: 'Invalid URL',
            details: 'Please enter a valid URL (e.g., https://example.com or example.com)'
        });
    }

    try {
        console.log(`[${new Date().toISOString()}] Generating CSP for: ${normalizedUrl} (wildcards: ${useWildcards})`);
        const csp = await generateCSP(normalizedUrl, useWildcards);
        console.log(`[${new Date().toISOString()}] Successfully generated CSP for: ${normalizedUrl}`);
        res.json({ csp });
    } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error generating CSP for ${normalizedUrl}:`, error);

        // Provide more detailed error information
        let errorMessage = 'Failed to generate CSP';
        let errorDetails = error.message || 'Unknown error';

        // Check for common errors
        if (error.message?.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
            errorMessage = 'HTTP/2 Protocol Error';
            errorDetails = 'The website may have HTTP/2 configuration issues. Try using a different browser or check if the site is accessible.';
        } else if (error.message?.includes('net::ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Domain Not Found';
            errorDetails = 'The domain could not be resolved. Please check the URL.';
        } else if (error.message?.includes('Timeout')) {
            errorMessage = 'Request Timeout';
            errorDetails = 'The page took too long to load. The site may be slow or unreachable.';
        }

        res.status(500).json({
            error: errorMessage,
            details: errorDetails,
            fullError: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
