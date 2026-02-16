interface NewsCardProps {
  image: string;
  category: string;
  categoryColor: string;
  date: string;
  title: string;
  description: string;
}

export function NewsCard({
  image,
  category,
  categoryColor,
  date,
  title,
  description,
}: NewsCardProps) {
  return (
    <article className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full sm:w-48 h-48 sm:h-auto rounded-xl bg-gray-200 shrink-0 overflow-hidden">
        <img alt={title} className="w-full h-full object-cover" src={image} />
      </div>
      <div className="flex flex-col justify-center py-2">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-md ${categoryColor} text-xs font-bold uppercase`}>
            {category}
          </span>
          <span className="text-gray-500 text-xs">{date}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        <a
          href="#"
          className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Leer más <span>→</span>
        </a>
      </div>
    </article>
  );
}
