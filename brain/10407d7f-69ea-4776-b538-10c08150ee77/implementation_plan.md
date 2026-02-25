# Portfolio Website Implementation Plan

Building a professional portfolio for Aditya Shevade with a black and grey theme, highlighting skills in AI, Machine Learning, and Python Development.

## Proposed Changes

### [Frontend Components]

#### [MODIFY] [index.css](file:///C:/Users/Aditya/.gemini/antigravity/scratch/portfolio-website/src/index.css)
- Change primary accent color to **Netflix Red (#E50914)**.
- Ensure deep black backgrounds and clean, high-contrast text.

#### [MODIFY] [App.tsx](file:///C:/Users/Aditya/.gemini/antigravity/scratch/portfolio-website/src/App.tsx)
- **Routing**: Wrap application in `BrowserRouter`.
- **Transitions**: Use `AnimatePresence` and `motion` from `framer-motion` for sliding effects.
- **Pages**:
    - `Home`: The main resume overview.
    - `Contact`: A dedicated page with all contact details.

#### [NEW] [Home.tsx](file:///C:/Users/Aditya/.gemini/antigravity/scratch/portfolio-website/src/pages/Home.tsx)
- Implementation of the main section content.

## Deployment Plan

To get a shareable link (e.g., `aditya-portfolio.vercel.app`), we will use **Vercel**.

### Steps:
1.  **Initialize Git**: I will ensure a `.gitignore` is present and help you prepare for pushing to GitHub.
2.  **GitHub Push**: You will need to create a new repository on GitHub and push this code.
3.  **Vercel Connection**: Connect your GitHub account to [Vercel](https://vercel.com/).
4.  **Instant Deploy**: Vercel will automatically detect Vite and deploy your site to a public URL.

### [NEW] [README.md](file:///C:/Users/Aditya/.gemini/antigravity/scratch/portfolio-website/README.md)
- Instructions for local development and one-click deployment.

### Automated Tests
- Run `npm run build` to ensure no TypeScript or build errors.
- Use `npm run dev` and verify visually (since browser tool is unavailable, I will rely on code correctness and user confirmation).

### Manual Verification
- Verify that all navigation links work correctly (smooth scroll).
- Check responsiveness on different screen widths in the design.
- Verify that GitHub/LinkedIn links are correct.
