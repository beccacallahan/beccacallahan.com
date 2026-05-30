# Becca Callahan Static Website

Static author website for Becca Callahan.

## Included

- Plain HTML, CSS, and JavaScript.
- Pages for Home, Books, About, Newsletter, Subscription, Groups, and Contact.
- Brand assets copied from the provided files.
- No paid site builder dependency.
- No legacy author name in the public-facing content.
- GitHub Pages `CNAME`, `.nojekyll`, `404.html`, sitemap, robots file, web manifest, canonical links, and social preview metadata.

## GitHub Pages

Recommended ownership: create the repository under Becca's own GitHub account so the website, domain, and long-term author brand are controlled by her. Add helpers as collaborators instead of hosting the site under someone else's account.

1. Create a Becca-controlled GitHub account.
2. Create a public repository, for example `becca-callahan-website` or `beccacallahan.com`.
3. Push the contents of this folder to `main`.
4. In GitHub, open `Settings -> Pages`.
5. Set source to `Deploy from a branch`, branch `main`, folder `/root`.
6. Add the custom domain: `www.beccacallahan.com`.
7. Point DNS at GitHub Pages:

```text
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   <github-username>.github.io
```

For a Crazy Domains-specific checklist, see [`docs/crazy-domains-dns.md`](docs/crazy-domains-dns.md).

## Site Notes

- Add Becca's helper account as a collaborator if someone else will maintain the site.
- Confirm the registrar points `www.beccacallahan.com` to GitHub Pages.
- Confirm the newsletter provider and sign-up URL.
- Confirm Facebook group links remain current.
- Confirm the public contact email or form service.
- Add final book titles, covers, blurbs, and buy links.
- Add official social links when confirmed.
