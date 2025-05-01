import Image from "next/image";
import "./book.css";

export interface BookProps {
  /** URL of the book cover image */
  cover: string;
  /** Display name/title of the book */
  name: string;
  /** Author of the book */
  author: string;
  /** Link to the book (Amazon, Goodreads, etc.) */
  link: string;
}

export default function Book({ cover, name, author, link }: BookProps) {
  return (
    <main className="book-component p-6 rounded-none my-6 bg-gray-200 dark:bg-[#333] text-sm flex flex-col items-center">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="book-link flex flex-col items-center p-4 text-center no-underline hover:no-underline"
      >
        <span className="book-image-container w-40 h-60 bg-center bg-cover mb-2 relative">
          <Image
            src={cover}
            alt={name}
            fill
            style={{ objectFit: "contain" }}
            className="book-image"
          />
        </span>
        <span className="book-title inline-block font-medium">{name}</span>
        <span className="book-author text-muted-foreground text-xs mt-1">{author}</span>
      </a>
    </main>
  );
}