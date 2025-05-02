import { getPosts } from '@/app/get-posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 3600;

interface Params {
  params: { category: string };
}

export default async function CategoryPage({ params }: Params) {
  const categoryParam = params.category;
  const category = decodeURIComponent(categoryParam);
  const posts = await getPosts();
  const filtered = posts
    .filter(post => post.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (filtered.length === 0) return notFound();

  return (
    <main className="max-w-2xl font-mono m-auto mb-10 text-sm">
      <h1 className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">
        category / <span className="text-gray-800 dark:text-gray-200">{category}</span>
      </h1>
      <header className="text-gray-500 dark:text-gray-600 flex items-center text-xs">
        <div className="w-12 h-9 text-left">date</div>
        <span className="grow pl-2">title</span>
        <span className="pl-4">views</span>
      </header>

      <ul>
        {filtered.map((post, i) => {
          const year = new Date(post.date).getFullYear();
          const firstOfYear = i === 0 || new Date(filtered[i-1].date).getFullYear() !== year;
          const lastOfYear = i === filtered.length - 1 || new Date(filtered[i+1].date).getFullYear() !== year;

          return (
            <li key={post.id}>
              <Link href={`/${year}/${post.id}`}>
                <span
                  className={`flex transition-[background-color] hover:bg-gray-100 dark:hover:bg-[#242424] active:bg-gray-200 dark:active:bg-[#222] border-y border-gray-200 dark:border-[#313131]
                    ${!firstOfYear ? "border-t-0" : ""}
                    ${lastOfYear ? "border-b-0" : ""}
                  `}
                >
                  <span
                    className={`py-3 flex grow items-center ${
                      !firstOfYear ? "ml-14" : ""
                    }`}
                  >
                    {firstOfYear && (
                      <span className="w-14 inline-block self-start shrink-0 text-gray-500 dark:text-gray-500">
                        {year}
                      </span>
                    )}

                    <span className="grow dark:text-gray-100">{post.title}</span>

                    <span className="text-gray-500 dark:text-gray-500 text-xs">
                      {post.viewsFormatted}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
} 