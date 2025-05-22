import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

app.get('/', (req: Request, res: Response) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile', 'openid'],
    });
    res.send(`<a href="${url}">Login com Google</a>`);
});

app.get('/callback', handleCallback);

async function handleCallback(req: Request, res: Response) {
    try {
        const code = req.query.code;

        if (typeof code !== 'string') {
            return res.status(400).send('Código de autorização ausente ou inválido.');
        }

        const tokenResponse = await client.getToken(code);
        const tokens = tokenResponse.tokens;

        client.setCredentials(tokens);

        if (!tokens.id_token) {
            return res.status(400).send('ID Token ausente nos tokens fornecidos.');
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.name || !payload?.email) {
            return res.status(400).send('Informações do usuário incompletas.');
        }

        const name = encodeURIComponent(payload.name);
        const email = encodeURIComponent(payload.email);

        res.redirect(`/welcome?name=${name}&email=${email}`);
    } catch (error) {
        console.error('Erro na autenticação', error);
        res.status(500).send('Erro ao autenticar com o Google');
    }
}

app.get('/welcome', (req: Request, res: Response) => {
    const { name, email } = req.query;

    res.send(`
        <h1>Bem-vindo, ${name}</h1>
        <p>Seu e-mail: ${email}</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
