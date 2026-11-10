import { useEffect, useState } from "react";
import { api } from "../../utils/api";

// The lesson stores a search query; the backend finds a matching YouTube video.
export default function VideoBlock({ query }) {
  const [video, setVideo] = useState(undefined);

  useEffect(() => {
    api(`/api/youtube?query=${encodeURIComponent(query)}`)
      .then((v) => setVideo(v[0] ?? null))
      .catch(() => setVideo(null));
  }, [query]);

  const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  if (video === undefined) return <div className="my-4 aspect-video animate-pulse rounded-lg bg-slate-200" />;
  if (!video)
    return (
      <a href={search} target="_blank" rel="noreferrer" className="my-4 block text-indigo-700 underline">
        Watch videos on “{query}” on YouTube
      </a>
    );
  return (
    <div className="my-4">
      <iframe
        className="aspect-video w-full rounded-lg"
        src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
        title={video.title}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <p className="mt-1 text-xs text-slate-500">
        {video.title} · <a href={search} target="_blank" rel="noreferrer" className="underline">more videos</a>
      </p>
    </div>
  );
}
