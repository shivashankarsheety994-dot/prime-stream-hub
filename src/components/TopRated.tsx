
import React from 'react';
import { Link } from 'react-router-dom';
import { VodStream } from '@/lib/xtream';

interface TopRatedProps {
  movies: VodStream[];
}

const TopRated: React.FC<TopRatedProps> = ({ movies }) => {
  const topRated = movies
    .sort((a, b) => (typeof b.rating === 'number' ? b.rating : 0) - (typeof a.rating === 'number' ? a.rating : 0))
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Top 5 Rated Movies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topRated.map((movie) => (
          <Link to={`/movie/${movie.stream_id}`} key={movie.stream_id}>
            <div className="rounded-lg overflow-hidden">
              <img
                src={movie.stream_icon || 'https://via.placeholder.com/150x225'}
                alt={movie.name}
                className="w-full h-auto object-cover"
              />
              <p className="text-white text-center mt-2">{movie.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopRated;
