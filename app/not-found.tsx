import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-3xl font-bold mb-6">404</h1>
      
      <p className="text-xl mb-10">Page not found</p>
      
      <blockquote className="my-6 text-gray-500 pl-3 border-l-4 dark:border-gray-600 dark:text-gray-400 max-w-lg">
        <p className="my-2 italic">
          &quot;These are not the droids you are looking for.&quot;
        </p>
        <p className="text-right text-sm mt-2">— Obi-Wan Kenobi</p>
      </blockquote>
      
      <Link 
        href="/" 
        className="mt-6 border-b text-gray-600 border-gray-300 transition-[border-color] hover:border-gray-600 dark:text-white dark:border-gray-500 dark:hover:border-white"
      >
        Return home
      </Link>
    </div>
  );
}