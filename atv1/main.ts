import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//definição das roles e permissões
const ROLES = {
  USER: {
    level: 1,
    permissions: ['read:own_profile', 'update:own_profile']
  },
  COACH: {
    level: 2,
    permissions: ['read:own_profile', 'update:own_profile', 'read:assigned_users', 'update:assigned_users']
  },
  ADMIN: {
    level: 3,
    permissions: ['read:all_profiles', 'update:all_profiles', 'delete:users', 'assign:coaches']
  }
};

//função para gerar token JWT
function generateToken(userId: number, email: string, role: keyof typeof ROLES): string {
  const SECRET: string = process.env.TOKEN_SECRET_KEY ?? 'secret-key-padrao';
  const EXPIRES_IN: string = process.env.EXPIRES_IN || '1h';

  if (!ROLES[role]) {
    throw new Error(`Invalid role: ${role}`);
  }

  const payload = {
    userId,
    email,
    role,
    level: ROLES[role].level,
    permissions: ROLES[role].permissions
  };

  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

//middleware p/ verificar permissão
function checkPermission(requiredPermission: string) {
  return (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY ?? 'secret-key-padrao');
      
      if (decoded.permissions.includes(requiredPermission)) {
        req.user = decoded;
        return next();
      }
      
      return res.status(403).json({ message: 'Insufficient permissions' });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

//criação do servidor express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//rota principal que demonstra o RBAC
app.get('/', (req, res) => {
  try {
    //entidades criadas 
    const adminToken = generateToken(1, 'admin@example.com', 'ADMIN');
    const coachToken = generateToken(2, 'coach@example.com', 'COACH');
    const userToken = generateToken(3, 'user@example.com', 'USER');
    
    //resposta com informações e tokens de exemplo
    res.json({
      message: 'Servidor RBAC com JWT do Lucas Martins - 202465058A',
      instructions: {
        test_admin: 'Use o token abaixo no header "Authorization: Bearer <token>" para testar rotas protegidas',
        test_user_and_coach: 'O token de usuário comum e do coach tem permissões limitadas',
        example_route: 'Tente acessar /protected após configurar o token no header, rota para testar a permissão máxima que é a do admin'
      },
      example_tokens: {
        admin: adminToken,
        coachToken: coachToken,
        user: userToken
      },
      roles_permissions: ROLES
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/protected', checkPermission('read:all_profiles'), (req, res) => {
  res.json({
    message: 'Você acessou uma rota que só admin tem acesso!!',
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT} para testar`);
});

export default app;