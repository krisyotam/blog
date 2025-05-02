"use client";
import { Suspense, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoriesPage() {
  const { data: posts } = useSWR('/api/posts', fetcher);

  const entries = useMemo(() => {
    if (!posts) return [];

    // Count categories and tags
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const tagCategoryMap: Record<string, Record<string, number>> = {};

    posts.forEach((post: any) => {
      const cat = post.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      (post.tags || []).forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        tagCategoryMap[tag] = tagCategoryMap[tag] || {};
        tagCategoryMap[tag][cat] = (tagCategoryMap[tag][cat] || 0) + 1;
      });
    });

    // Build category entries
    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ type: 'category', name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Build tag entries with primary category
    const tags = Object.entries(tagCounts).map(([name, count]) => {
      const catMap = tagCategoryMap[name];
      const primary = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0][0];
      return { type: 'tag', name, count, primaryCategory: primary };
    });

    // Flatten: category then its tags
    const list: any[] = [];
    categories.forEach(cat => {
      list.push(cat);
      tags
        .filter(tag => tag.primaryCategory === cat.name)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(tag => list.push(tag));
    });
    return list;
  }, [posts]);

  return (
    <Suspense fallback={null}>
      <main className="max-w-2xl font-mono m-auto mb-10 text-sm">
        <header className="text-gray-500 dark:text-gray-600 flex items-center text-xs">
          <span className="w-12"></span>
          <span className="grow pl-2">Category / Tag</span>
          <span className="pl-4">Count</span>
        </header>
        <ul>
          {entries.map((entry, i) => (
            <li key={entry.name}>
              <Link
                href={`/${entry.type === 'category' ? 'categories' : 'tags'}/${encodeURIComponent(entry.name.toLowerCase())}`}
                className={`flex transition-[background-color] hover:bg-gray-100 dark:hover:bg-[#242424] active:bg-gray-200 dark:active:bg-[#222] border-y border-gray-200 dark:border-[#313131] ${
                  i > 0 ? 'border-t-0' : ''
                } ${
                  i === entries.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <span className={`py-3 flex grow items-center ${entry.type === 'tag' ? 'ml-14' : ''}`}>
                  {entry.name}
                </span>
                <span className="text-gray-500 dark:text-gray-500 text-xs py-3 px-4">
                  {entry.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Suspense>
  );
} 