import Link from "next/link";
import Image from "next/image";
import { Author } from "@/lib/authors-data";

const AuthorCard = ({ author }: { author: Author }) => {
  const normalizedAuthorName = encodeURIComponent(author.name);

  return (
    <Link href={`/authors/${normalizedAuthorName}`} className="block">
      <div className="relative overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 hover:shadow-2xl hover:scale-105">
        <div className="relative h-64 w-full">
          {/* Author Image */}
          <Image
            src={author.image}
            alt={author.name}
            width={300}
            height={400}
            className="object-cover h-full w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Author Details Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col justify-end text-white">
            <h2 className="text-xl font-bold truncate">{author.name}</h2>
            <p className="text-sm text-gray-400">
              {author.bookCount} {author.bookCount === 1 ? "Book" : "Books"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuthorCard;
