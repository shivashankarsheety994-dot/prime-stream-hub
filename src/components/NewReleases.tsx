
import React from 'react';
import { Link } from 'react-router-dom';
import { VodStream } from '@/lib/xtream';

interface NewReleasesProps {
  movies: VodStream[];
}

const NewReleases: React.FC<NewReleasesProps> = ({ movies }) => {
  const newReleases = movies
    .sort((a, b) => parseInt(b.added || '0', 10) - parseInt(a.added || '0', 10))
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Top 5 New Releases</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {newReleases.map((movie) => (
          <Link to={`/movie/${movie.stream_id}`} key={movie.stream_id}>
            <div className="rounded-lg overflow-hidden relative">
              <img
                src={movie.stream_icon || 'https://via.placeholder.com/150x225'}
                alt={movie.name}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 poster-text-background p-2">
                <p className="text-black text-center">{movie.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewReleases;
