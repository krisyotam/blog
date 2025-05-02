import Image from "next/image";

export interface Book {
  title: string;
  author: string;
  cover: string;
}

interface BooksProps {
  books: Book[];
}

export default function Books({ books }: BooksProps) {
  return (
    <div className="books grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-10 px-5 mb-10">
      {books.map((book) => (
        <div
          key={book.title}
          className="text-sm flex flex-col items-center bg-gray-200 dark:bg-[#333] p-4"
        >
          <div className="w-40 h-60 mb-2 relative">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <h3 className="font-medium text-center">{book.title}</h3>
          <p className="text-xs text-center">{book.author}</p>
        </div>
      ))}
    </div>
  );
}
