const secretKey = process.env.TURNSTILE_SECRET_KEY;

const verifyTurnstile = async (turnstileResponse, ip) => {
    const response = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: turnstileResponse, remoteip: ip }),
    });
    return await response.json();
};

module.exports = verifyTurnstile;