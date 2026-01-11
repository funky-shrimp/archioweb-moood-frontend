
function decodeJWT(token) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
        // You can throw an error, return null, or handle it as appropriate for your application
        console.warn('Attempted to decode an invalid or empty JWT.', { tokenProvided: token });
        return null; // Or throw new Error('Invalid or missing JWT');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT');
    }
    
    // Decode the payload (second part)
    try {
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (e) {
        console.error('Error decoding JWT payload:', e);
        throw new Error('Failed to decode JWT payload');
    }
}

// Usage

export { decodeJWT };