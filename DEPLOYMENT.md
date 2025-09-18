# Deployment Guide

## Vercel Deployment

This Next.js project is ready for deployment on Vercel.

### Quick Deploy

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

### Manual Deploy (Alternative)

If you prefer to use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: mechinterp-article (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Build Verification

The project has been tested and builds successfully:
- ✅ No TypeScript errors
- ✅ No ESLint errors (only minor warnings)
- ✅ All dependencies resolved
- ✅ Static generation working

### Project Structure

- **Main page**: `/src/app/page.tsx` - The interactive article
- **Components**: `/src/components/` - All visualization components
- **Data**: `/public/` - JSON data files for the visualizations
- **Hooks**: `/src/hooks/` - Custom React hooks for data management

### Notes

- The project uses static generation, so it will be fast and SEO-friendly
- All data is loaded from static JSON files in the public directory
- No external API calls or database dependencies
- Optimized for production with Next.js 15

### Troubleshooting

If deployment fails:
1. Check that all files are committed to git
2. Ensure `package.json` has correct dependencies
3. Verify that the build works locally with `npm run build`
