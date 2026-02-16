interface FacilityCardProps {
    image: string;
    title: string;
    description: string;
}

export function FacilityCard({ image, title, description }: FacilityCardProps) {
    return (
        <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
            <img
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">

                <h3 className="text-white text-xl font-bold mb-1">{title}</h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {description}
                </p>
            </div>
        </div>
    );
}
