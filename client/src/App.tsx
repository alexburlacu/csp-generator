import React, { useState } from 'react'

function App() {
    const [url, setUrl] = useState('')
    const [csp, setCsp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [useWildcards, setUseWildcards] = useState(true)

    const handleGenerate = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setCsp('');

        try {
            const response = await fetch('http://localhost:3000/api/generate-csp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, useWildcards })
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Show detailed error if available
                const errorMsg = errorData.details
                    ? `${errorData.error}: ${errorData.details}`
                    : errorData.error || 'Failed to generate CSP';
                throw new Error(errorMsg);
            }

            const data = await response.json();
            setCsp(data.csp);
        } catch (err: any) {
            setError(err.message || 'Error occurred while generating CSP');
        } finally {
            setLoading(false);
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(csp);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleGenerate();
        }
    }

    return (
        <div className="container">
            <header className="header">
                <h1>CSP Generator</h1>
                <p>Automatically generate Content Security Policy headers by crawling your website</p>
            </header>

            <div className="card">
                <div className="input-group">
                    <input
                        type="url"
                        className="input"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        className="button"
                        onClick={handleGenerate}
                        disabled={loading || !url}
                    >
                        {loading ? (
                            <span className="loading">
                                <span className="spinner"></span>
                                Crawling...
                            </span>
                        ) : (
                            'Generate CSP'
                        )}
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={useWildcards}
                            onChange={(e) => setUseWildcards(e.target.checked)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                            Use wildcards for common services (e.g., *.google-analytics.com instead of region1.google-analytics.com)
                        </span>
                    </label>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {csp && (
                    <div className="result">
                        <h3>Generated CSP Header</h3>
                        <textarea
                            className="textarea"
                            readOnly
                            value={csp}
                        />
                        <button
                            className="copy-button"
                            onClick={handleCopy}
                        >
                            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
