
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, RotateCcw, Star } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [isIphone, setIsIphone] = useState(false);

  useEffect(() => {
    setIsIphone(/iPhone/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    // Wait until credentials and id are available
    if (!credentials || !id) {
      return;
    }

    window.scrollTo(0, 0);

    const fetchMovieData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const vods = await getVodStreams(credentials.username, credentials.password);
        const foundMovie = vods.find(m => m.stream_id.toString() === id);

        if (foundMovie) {
          setMovie(foundMovie);
          const detailedInfo = await getVodInfo(credentials.username, credentials.password, foundMovie.stream_id);
          setVodInfo(detailedInfo);

          const savedProgress = getProgress(foundMovie.stream_id);
          if (savedProgress && savedProgress.position > 5 && savedProgress.duration > 0 && (savedProgress.position / savedProgress.duration) < 0.95) {
            setResumeTime(savedProgress.position);
          }
        } else {
          setError("Movie not found in our records.");
        }
      } catch (e: any) {
        console.error("Error fetching movie details:", e);
        setError(e.message || "An unknown error occurred while fetching movie details.");
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

  if (error) {
    return (
      <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center text-center p-4">
         <div className="mb-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-red-500">Something Went Wrong</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-white bg-black min-h-screen flex items-center justify-center text-center p-4">
        <p>Movie not found.</p>
      </div>
    );
  }

  const year = vodInfo?.info?.releasedate
    ? new Date(vodInfo.info.releasedate).getFullYear()
    : movie.added
    ? new Date(parseInt(movie.added, 10) * 1000).getFullYear()
    : 'N/A';

  const backgroundUrl = vodInfo?.info?.movie_image || movie.stream_icon || '';
  const streamUrl = `${credentials.url}/movie/${credentials.username}/${credentials.password}/${movie.stream_id}.${movie.container_extension}`;

  return (
    <div className="bg-black min-h-screen text-white">
      <div
        className="absolute top-0 left-0 w-full h-[60vh] z-0"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ChevronLeft />
        </Button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pt-[25vh]">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img
            src={movie.stream_icon || vodInfo?.info?.movie_image || 'https://via.placeholder.com/200x300'}
            alt={movie.name}
            className="w-48 md:w-60 rounded-md shadow-lg shrink-0"
          />
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-white shadow-lg">{movie.name}</h1>

            <div className="flex items-center justify-center md:justify-start space-x-4 my-3 text-sm text-gray-300">
              <span>{year}</span>
              {vodInfo?.info?.duration && <span>{vodInfo.info.duration}</span>}
              {movie.rating && Number(movie.rating) > 0 ? (
                <span className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                  {Number(movie.rating).toFixed(1)}
                </span>
              ) : (
                <span className="border px-2 rounded text-xs">U/A 16+</span>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-4 my-5">
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
              {isIphone && (
                <a href={`vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(streamUrl)}`}>
                    <Button>Play on VLC</Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-3">Overview</h2>
          <p className="text-muted-foreground max-w-3xl">
            {vodInfo?.info?.plot || 'No description available.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm mt-6 max-w-3xl">
            {vodInfo?.info?.genre && (
              <div>
                <strong className="block text-gray-400">Genre</strong>
                <span>{vodInfo.info.genre}</span>
              </div>
            )}
            {vodInfo?.info?.director && (
              <div>
                <strong className="block text-gray-400">Director</strong>
                <span>{vodInfo.info.director}</span>
              </div>
            )}
            {vodInfo?.info?.cast && (
              <div className="sm:col-span-2 md:col-span-3">
                <strong className="block text-gray-400">Cast</strong>
                <span>{vodInfo.info.cast}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
