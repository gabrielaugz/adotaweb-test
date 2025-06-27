# AdotaWeb

**Site para adoção de pets**  
Sistema para listar, buscar e adotar animais disponíveis em ONGs parceiras.
Acessível via: https://adotaweb-test.onrender.com/

---

## ✨ Funcionalidades

- Listagem e filtros dinâmicos (tipo, cidade, atributos)  
- CRUD completo de pets  
- Upload de fotos via Cloudinary  
- Formulário de contato integrado ao Formspree  
- Guia de adoção com referências  
- Layout responsivo  

---

## 📦 Tecnologias

- **Frontend**: React 18 · React Router · Create React App · @formspree/react  
- **Backend**: Node.js · Express · PostgreSQL (`pg`) · Multer + Cloudinary  
- **Deploy**: Render.com  

---

## 🏗 Arquitetura e Requisitos Técnicos

1. **Arquitetura Multitier**  
   - **Apresentação**: SPA em React, rodando no browser e consumindo a API.  
   - **Lógica de Negócio**: Node.js + Express no servidor, processa regras, autenticação e uploads.  
   - **Dados**: PostgreSQL para persistência relacional; Cloudinary para armazenamento de imagens.

2. **Persistência de Dados**  
   - Banco relacional (PostgreSQL) via `DATABASE_URL`.  
   - Armazenamento de fotos e mídias na nuvem (Cloudinary).

3. **Interface Web Interativa e Responsiva**  
   - Componentes React com atualizações em tempo real via fetch/axios.  
   - Formulário de contato usa hook do Formspree para feedback imediato (loading, sucesso, erro).

4. **API RESTful**  
   - Endpoints Express em `/api/...` (GET, POST, PUT, DELETE). 
   - CORS configurado para permitir requisições do frontend hospedado no Render.

---

## 🚀 Como executar localmente

1. Clone o repositório  
   ```bash
   git clone https://github.com/gabrielaugz/adotaweb-test
   cd adotaweb

2. Defina as variáveis de ambiente abaixo (arquivo .env na raiz):
    DATABASE_URL=
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    REACT_APP_API_URL=
    REACT_APP_FORMSPREE_ID=

3. Instale e rode
    # Backend
    cd backend
    npm install
    npm run seed # (opcional para povoar o banco inicialmente)
    npm start     

    # Frontend
    cd ../frontend
    npm install
    npm start