"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Suspense } from "react";
import useSWR from "swr";

type SortSetting = ["date" | "views", "desc" | "asc"];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Posts({ posts: initialPosts, revalidate = true }: { posts: any[]; revalidate?: boolean }) {
  const [sort, setSort] = useState<SortSetting>(["date", "desc"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 14;
  const [mounted, setMounted] = useState(false);
  
  const { data: posts } = useSWR(
    "/api/posts",
    fetcher,
    {
      fallbackData: initialPosts,
      refreshInterval: revalidate ? 5000 : 0,
      revalidateOnMount: revalidate,
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  function sortDate() {
    setSort(sort => [
      "date",
      sort[0] !== "date" || sort[1] === "asc" ? "desc" : "asc",
    ]);
  }

  function sortViews() {
    setSort(sort => [
      sort[0] === "views" && sort[1] === "asc" ? "date" : "views",
      sort[0] !== "views" ? "desc" : sort[1] === "asc" ? "desc" : "asc",
    ]);
  }

  return (
    <Suspense fallback={null}>
      <main className="max-w-2xl font-mono m-auto mb-10 text-sm" suppressHydrationWarning>
        <header className="text-gray-500 dark:text-gray-600 flex items-center text-xs">
          <button
            onClick={sortDate}
            className={`w-12 h-9 text-left  ${
              sort[0] === "date" && sort[1] !== "desc"
                ? "text-gray-700 dark:text-gray-400"
                : ""
            }`}
          >
            date
            {sort[0] === "date" && sort[1] === "asc" && "↑"}
          </button>
          <span className="grow pl-2">title</span>
          <button
            onClick={sortViews}
            className={`
                  h-9
                  pl-4
                  ${
                    sort[0] === "views"
                      ? "text-gray-700 dark:text-gray-400"
                      : ""
                  }
                `}
          >
            views
            {sort[0] === "views" ? (sort[1] === "asc" ? "↑" : "↓") : ""}
          </button>
        </header>

        {mounted && (
          <>
            <List 
              posts={posts} 
              sort={sort} 
              currentPage={currentPage}
              postsPerPage={postsPerPage}
            />

            <Pagination 
              totalPosts={posts.length} 
              postsPerPage={postsPerPage} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
            />
          </>
        )}
      </main>
    </Suspense>
  );
}

function List({ posts, sort, currentPage, postsPerPage }) {
  // sort can be ["date", "desc"] or ["views", "desc"] for example
  const sortedPosts = useMemo(() => {
    const [sortKey, sortDirection] = sort;
    return [...posts].sort((a, b) => {
      if (sortKey === "date") {
        return sortDirection === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortDirection === "desc" ? b.views - a.views : a.views - b.views;
      }
    });
  }, [posts, sort]);

  // Calculate current posts to display
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Track posts within the same year to show year every 5 posts
  let postsInCurrentYear = 0;
  let currentYear: number | null = null;

  return (
    <ul>
      {currentPosts.map((post, i: number) => {
        // We need to calculate the true index in the sorted array for year tracking
        const trueIndex = indexOfFirstPost + i;
        const year = getYear(post.date);
        
        // Check if this is a new year
        if (currentYear !== year) {
          currentYear = year;
          postsInCurrentYear = 1;
        } else {
          postsInCurrentYear++;
        }

        const firstOfYear =
          !sortedPosts[trueIndex - 1] || getYear(sortedPosts[trueIndex - 1].date) !== year;
        
        // Show the year if it's first of year OR every 5th post within the same year
        const showYear = firstOfYear || postsInCurrentYear % 5 === 0;
        
        const lastOfYear =
          !sortedPosts[trueIndex + 1] || getYear(sortedPosts[trueIndex + 1].date) !== year;

        return (
          <li key={post.id}>
            <Link href={`/${new Date(post.date).getFullYear()}/${post.id}`}>
              <span
                className={`flex transition-[background-color] hover:bg-gray-100 dark:hover:bg-[#242424] active:bg-gray-200 dark:active:bg-[#222] border-y border-gray-200 dark:border-[#313131]
                ${!showYear ? "border-t-0" : ""}
                ${lastOfYear ? "border-b-0" : ""}
              `}
              >
                <span
                  className={`py-3 flex grow items-center ${
                    !showYear ? "ml-14" : ""
                  }`}
                >
                  {showYear && (
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
  );
}

function Pagination({ totalPosts, postsPerPage, currentPage, setCurrentPage }) {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-between items-center mt-6 text-xs">
      <div>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#242424]"
          } rounded`}
        >
          &lt; Prev
        </button>
      </div>
      
      <div className="flex space-x-1 justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            className={`px-3 py-2 rounded ${
              currentPage === pageNumber
                ? "bg-gray-200 dark:bg-[#313131] font-medium"
                : "hover:bg-gray-100 dark:hover:bg-[#242424]"
            }`}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      
      <div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#242424]"
          } rounded`}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}

function getYear(date: string) {
  return new Date(date).getFullYear();
}
