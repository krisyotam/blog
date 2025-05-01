import { Header } from "./header";
import { getPosts } from "../get-posts";
import { Citation } from "./components/citation";

export const revalidate = 60;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = await getPosts();

  return (
    <article className="text-gray-800 dark:text-gray-300 mb-10">
      <Header posts={posts} />
      {children}
    </article>
  );
}
