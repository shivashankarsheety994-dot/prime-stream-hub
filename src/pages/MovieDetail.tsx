
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, RotateCcw } from 'lucide-react';
import { getVodStreams, VodStream, getVodInfo, VodInfo } from "@/lib/xtream";
import { useAuth } from "@/context/AuthContext";
import { CinemaLoader } from "@/components/CinemaLoader";
import { usePlayer } from '@/context/PlayerContext';
import { getProgress, saveProgress } from '@/lib/watchProgress';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { credentials } = useAuth();
  const { play } = usePlayer();
  const [movie, setMovie] = useState<VodStream | null>(null);
  const [vodInfo, setVodInfo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number | null>(null);

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

        const savedProgress = getProgress(foundMovie.stream_id);
        if (savedProgress && savedProgress.position > 5 && savedProgress.duration > 0 && (savedProgress.position / savedProgress.duration) < 0.95) {
          setResumeTime(savedProgress.position);
        }
      }

      setLoading(false);
    };

    fetchMovieData();
  }, [credentials, id]);

  const handleStartOver = () => {
    if (!movie) return;
    const progress = getProgress(movie.stream_id);
    if (progress) {
      saveProgress(movie, 0, progress.duration);
    }
    play(movie!, 0);
    setResumeTime(null);
  };

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
          className="w-full h-[50vh] object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ChevronLeft />
          </Button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 items-start">
          <img
            src={movie.stream_icon || vodInfo?.info?.movie_image || 'https://via.placeholder.com/200x300'}
            alt={movie.name}
            className="w-48 rounded-md shadow-lg"
          />
          <div className="mt-4">
            <h1 className="text-4xl font-bold text-white shadow-lg">{movie.name}</h1>
            <div className="flex items-center space-x-4 my-2 text-sm text-gray-300">
              <span>{year}</span>
              {vodInfo?.info?.duration && <span>{vodInfo.info.duration}</span>}
              <span className="border px-2 rounded">{movie.rating ? `Rating: ${movie.rating}`: 'U/A 16+'}</span>
            </div>
            <div className="flex items-center space-x-4 my-4">
              {resumeTime ? (
                <>
                  <Button onClick={() => play(movie!, resumeTime)} className="bg-white text-black">
                    <Play className="mr-2 h-4 w-4" /> Continue
                  </Button>
                  <Button onClick={handleStartOver} variant="outline" className="text-white">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                  </Button>
                </>
              ) : (
                <Button onClick={() => play(movie!)} className="bg-white text-black">
                  <Play className="mr-2 h-4 w-4" /> Play
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
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
