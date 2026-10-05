# Deploy ConvertForge

## GitHub Pages
1. Create a new repository and upload the contents of this folder.
2. In GitHub: Settings → Pages → Deploy from branch → `main` / root.
3. If using a custom domain, replace `convertforge.example` in the HTML, sitemap and robots.txt with your real domain.
4. Add a `CNAME` file containing only your apex domain, for example `example.com`.
5. DNS: apex A records should point to GitHub Pages IPs and `www` should CNAME to `YOUR-USERNAME.github.io`.
6. Enable HTTPS after GitHub issues the certificate.

## Local preview
Use a local web server (for example `python3 -m http.server`) rather than double-clicking files. The site also uses relative asset paths so nested pages work correctly when served from a folder.

## Heavy conversions
The included browser engine intentionally does not fake unsupported DOCX/PDF/video/audio conversions. Connect the relevant tool to a real backend/API such as FFmpeg, LibreOffice, a conversion API, or a serverless worker when you are ready.
