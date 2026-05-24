
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play } from 'lucide-react';
import { getVodStreams, VodStream, getVodInfo, VodInfo } from "@/lib/xtream";
import { useAuth } from "@/context/AuthContext";
import { CinemaLoader } from "@/components/CinemaLoader";
import { usePlayer } from '@/context/PlayerContext';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { credentials } = useAuth();
  const { play } = usePlayer();
  const [movie, setMovie] = useState<VodStream | null>(null);
  const [vodInfo, setVodInfo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!credentials || !id) return;

    window.scrollTo(0, 0);

    const fetchMovieData = async () => {
      setLoading(true);
      const vods = await getVodStreams(credentials.username, credentials.password);
      const foundMovie = vods.find(m => m.stream_id.toString() === id);
      setMovie(foundMovie || null);

      if (foundMovie) {
        const detailedInfo = await getVodInfo(credentials.username, credentials.password, foundMovie.stream_id);
        setVodInfo(detailedInfo);
      }

      setLoading(false);
    };

    fetchMovieData();
  }, [credentials, id]);

  if (loading) {
    return <CinemaLoader fullscreen label="Loading movie details..." />;
  }

  if (!movie) {
    return <div className="text-white text-center py-10">Movie not found</div>;
  }

  const year = vodInfo?.info?.releasedate
    ? new Date(vodInfo.info.releasedate).getFullYear()
    : movie.added
    ? new Date(parseInt(movie.added, 10) * 1000).getFullYear()
    : 'N/A';

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative">
        <img
          src={vodInfo?.info?.movie_image || movie.stream_icon || 'https://via.placeholder.com/800x450'}
          alt={movie.name}
          className="w-full h-80 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ChevronLeft />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-2">{movie.name}</h1>
        <div className="flex items-center space-x-4 my-4">
            <Button onClick={() => play(movie)} className="bg-white text-black flex-grow">
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
          <span>{year}</span>
          {vodInfo?.info?.duration && <span>{vodInfo.info.duration}</span>}
          <span className="border px-2 rounded">{movie.rating ? `Rating: ${movie.rating}`: 'U/A 16+'}</span>
        </div>
        <p className="my-4 text-muted-foreground">
          {vodInfo?.info?.plot || 'No description available.'}
        </p>

        <div className="space-y-2 text-sm">
          {vodInfo?.info?.genre && (
            <div><strong>Genre:</strong> {vodInfo.info.genre}</div>
          )}
          {vodInfo?.info?.director && (
            <div><strong>Director:</strong> {vodInfo.info.director}</div>
          )}
          {vodInfo?.info?.cast && (
            <div><strong>Cast:</strong> {vodInfo.info.cast}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
