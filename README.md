# Deployment: Netlify (Frontend) & Render (Backend)

## Hosting the Frontend (React) on Netlify

1. **Build your React app:**
   ```sh
   npm run build
   ```
2. **Sign up / Log in to Netlify:**
   - Go to https://netlify.com and log in or create an account.
3. **Deploy your site:**
   - Option 1: Connect your GitHub/GitLab/Bitbucket repo and select your project.
   - Option 2: Drag and drop the `dist` or `build` folder (from the previous step) into the Netlify dashboard.
4. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist` (or `build` if using Create React App)
5. **Deploy:**
   - Netlify will build and deploy your site. You’ll get a live URL.
6. **(Optional) Set environment variables:**
   - In Site Settings > Environment Variables, add any needed variables (e.g., VITE_API_URL).

## Hosting the Backend (Node.js/Express) on Render

1. **Push your backend code to a Git repository** (GitHub, GitLab, Bitbucket).
2. **Sign up / Log in to Render:**
   - Go to https://render.com and log in or create an account.
3. **Create a new Web Service:**
   - Click "New +" > "Web Service".
   - Connect your repository and select the backend folder.
4. **Configure service:**
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node index.js` (or your entry point)
   - Set environment variables (e.g., `MONGODB_URI`, secrets) in the Render dashboard.
5. **Deploy:**
   - Render will build and deploy your backend. You’ll get a public API URL.

## Final Steps

- **Update frontend API URLs:**
  - In your frontend code or environment variables, set the API base URL to your Render backend URL.
- **CORS:**
  - In your backend, ensure CORS middleware allows requests from your Netlify domain (e.g., `https://your-site.netlify.app`).
- **Secrets:**
  - Never commit secrets. Use Render’s environment variable settings for production secrets.

## References
- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs/deploy-node-express-app)