from pathlib import Path
root=Path('/tmp/converter-site')
for f in root.rglob('*.html'):
    s=f.read_text()
    depth=len(f.parent.relative_to(root).parts)
    pre='../'*depth
    # all internal absolute paths -> relative paths; preserve external URLs
    s=s.replace('href="/assets/style.css"',f'href="{pre}assets/style.css"')
    s=s.replace('src="/assets/app.js"',f'src="{pre}assets/app.js"')
    s=s.replace('href="/"',f'href="{pre}"')
    for old,new in [('href="/tools/"',f'href="{pre}tools/"'),('href="/categories/"',f'href="{pre}categories/"'),('href="/about/"',f'href="{pre}about/"'),('href="/contact/"',f'href="{pre}contact/"'),('href="/privacy/"',f'href="{pre}privacy/"'),('href="/terms/"',f'href="{pre}terms/"')]: s=s.replace(old,new)
    # tool/category links
    import re
    s=re.sub(r'href="/categories/([^\"]+)/"',lambda m:f'href="{pre}categories/{m.group(1)}/"',s)
    s=re.sub(r'href="/tools/([^\"]+)/"',lambda m:f'href="{pre}tools/{m.group(1)}/"',s)
    # canonical based on current page path; example domain placeholder retained
    rel=f.parent.relative_to(root).as_posix()
    canon='https://convertforge.example/' + (rel+'/' if rel!='.' else '')
    s=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="{canon}">',s)
    f.write_text(s)
# Add categories index
cats=[('image','Image Converters'),('document','Document & Data Converters'),('media','Audio & Video Converters'),('popular','Popular Converters')]
p=root/'categories'/'index.html'
links=''.join(f'<a class="category" href="{c}/"><strong>{n}</strong><span>Browse converters</span></a>' for c,n in cats)
p.write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Converter Categories | ConvertForge</title><meta name="description" content="Browse ConvertForge converter categories."><link rel="canonical" href="https://convertforge.example/categories/"><link rel="stylesheet" href="../assets/style.css"></head><body><nav class="nav"><div class="container navin"><a class="logo" href="../">Convert<span>Forge</span></a><div class="navlinks"><a href="../">Home</a><a href="../tools/">All Tools</a><a href="../about/">About</a><a href="../contact/">Contact</a></div></div></nav><main class="container"><div class="content"><div class="breadcrumbs"><a href="../">Home</a> / Categories</div><h1>Converter Categories</h1><p>Browse the library by file type and use case.</p><div class="category-grid">{links}</div></div></main><footer class="footer"><div class="container copyright">© 2026 ConvertForge.</div></footer><script src="../assets/app.js"></script></body></html>''')
# deployment guide
(root/'DEPLOYMENT.md').write_text('''# Deploy ConvertForge\n\n## GitHub Pages\n1. Create a new repository and upload the contents of this folder.\n2. In GitHub: Settings → Pages → Deploy from branch → `main` / root.\n3. If using a custom domain, replace `convertforge.example` in the HTML, sitemap and robots.txt with your real domain.\n4. Add a `CNAME` file containing only your apex domain, for example `example.com`.\n5. DNS: apex A records should point to GitHub Pages IPs and `www` should CNAME to `YOUR-USERNAME.github.io`.\n6. Enable HTTPS after GitHub issues the certificate.\n\n## Local preview\nUse a local web server (for example `python3 -m http.server`) rather than double-clicking files. The site also uses relative asset paths so nested pages work correctly when served from a folder.\n\n## Heavy conversions\nThe included browser engine intentionally does not fake unsupported DOCX/PDF/video/audio conversions. Connect the relevant tool to a real backend/API such as FFmpeg, LibreOffice, a conversion API, or a serverless worker when you are ready.\n''')
# add 404
(root/'404.html').write_text('''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found | ConvertForge</title><link rel="stylesheet" href="/assets/style.css"></head><body><main class="container" style="padding:100px 0;text-align:center"><h1>Page not found</h1><p>The converter page you requested does not exist.</p><a class="btn" href="/">Back to ConvertForge</a></main></body></html>''')
