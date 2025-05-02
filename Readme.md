# blog

This is the blog that powers `krisyotam.net`, built on
[next.js](https://nextjs.org/) and
deployed to the cloud via [Vercel](https://vercel.com).

## How to run

First, install [Vercel CLI](https://vercel.com/download).

### Development

```
vc dev
```

### Deployment

#### Staging

```bash
vc
```

This is the equivalent of submitting a PR with the [GitHub integration](https://vercel.com/github)

#### Production

```bash
vc --prod
```

This is the equivalent of `git push` to `master` (or merging a PR to master)

## Architecture

### Pure components

Every stateless pure component is found under `./components`.

Every component that has to do with styling the post's markup
is found under `./components/post/`

These components make up the _style guide_ of the application.

### Blog posts

Every blog post is a static page hosted under `pages/$year/`.

This allows every post to load arbitrary modules, have custom layouts
and take advantage of automatic code splitting and lazy loading.

This means that the bloat of a single post doesn't "rub off on" the
rest of the site.

An index of all posts is maintained in JSON format as `./posts.json`
for practical reasons.

## TikZ Support

This blog includes support for rendering [TikZ](https://tikz.dev/) diagrams in MDX files. To use TikZ, the following dependencies must be installed:

- `latex` - For compiling TikZ code to DVI
- `dvisvgm` - For converting DVI to SVG

### Usage in MDX

```mdx
<Tikz>
{String.raw`
\begin{tikzpicture}
  % Nodes
  \node[circle,draw] (A) at (0,0) {A};
  \node[circle,draw] (B) at (2,1) {B};
  \node[circle,draw] (C) at (2,-1) {C};
  \node[circle,draw] (D) at (4,0) {D};
  
  % Edges
  \draw[->] (A) -- (B);
  \draw[->] (A) -- (C);
  \draw[->] (B) -- (D);
  \draw[->] (C) -- (D);
\end{tikzpicture}
`}
</Tikz>
```

### Deployment on Vercel

To deploy this blog with TikZ support on Vercel, you need to set up a build environment with the required TeX dependencies. 

1. Create a `.vercelignore` file to exclude unnecessary files from the deployment.
2. Set up a custom build script in your `package.json` that installs the required dependencies.

Example build command for Ubuntu-based Vercel deployments:

```
apt-get update && apt-get install -y texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-pictures dvisvgm && npm run build
```

For more information, refer to Vercel's documentation on [installing system dependencies](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js#installing-system-dependencies).
