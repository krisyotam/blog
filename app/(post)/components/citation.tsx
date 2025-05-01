import postsData from "@/app/posts.json";
import { cn } from "@/lib/utils";

export function Citation({ id }: { id: string }) {
  const post = postsData.posts.find((p) => p.id === id);
  if (!post) return null;

  const dateObj = new Date(post.date);
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("default", { month: "short" });
  const url = `https://krisyotam.net/${year}/${post.id}`;
  const author = "Yotam, Kris";
  const journal = "krisyotam.net";

  const humanCitation = `${author}. (${month} ${year}). ${post.title}. ${journal}. ${url}`;
  const key = `yotam${year}${post.id}`;
  const bibtex = [
    `@article{${key},`,
    `  title   = "${post.title}",`,
    `  author  = "${author}",`,
    `  journal = "${journal}",`,
    `  year    = "${year}",`,
    `  month   = "${month}",`,
    `  url     = "${url}"`,
    `}`,
  ].join("\n");

  // Apply the same styling as Box component
  const baseStyles = cn(
    "relative max-w-2xl mx-auto",
    "p-6",
    "rounded-none",
    "my-6",
    "bg-gray-200",
    "dark:bg-[#333]",
    "[&>*:first-child]:mt-0",
    "[&>*:last-child]:mb-0"
  );

  return (
    <div className={baseStyles}>
      <h3 className="text-sm font-medium mb-4">Citation</h3>
      
      {/* Human-readable */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1">Cited as:</p>
        <div className="border-l-2 border-muted pl-4 py-2">
          <p className="text-sm">{humanCitation}</p>
        </div>
      </div>
      
      <p className="text-center text-xs text-muted-foreground my-2">Or</p>
      
      {/* BibTeX */}
      <div>
        <pre className="language-bibtex whitespace-pre-wrap font-mono text-sm bg-muted/50 p-3 rounded-none">
          <code>{bibtex}</code>
        </pre>
      </div>
    </div>
  );
}