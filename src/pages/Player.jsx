import { useParams, useNavigate } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import VideoPlayer from '../components/players/VideoPlayer';
import AudioPlayer from '../components/players/AudioPlayer';
import ImageViewer from '../components/players/ImageViewer';

const Player = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { media } = useMedia();

  const currentMedia = media.find((item) => item.id === parseInt(id));

  if (!currentMedia) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Media not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    navigate(-1);
  };

  if (type === 'video') {
    return <VideoPlayer media={currentMedia} onClose={handleClose} />;
  }

  if (type === 'audio') {
    const audioPlaylist = media.filter((item) => item.type === 'audio');
    return (
      <AudioPlayer
        media={currentMedia}
        playlist={audioPlaylist}
        onClose={handleClose}
      />
    );
  }

  if (type === 'image') {
    const imageList = media.filter((item) => item.type === 'image');
    return (
      <ImageViewer
        media={currentMedia}
        images={imageList}
        onClose={handleClose}
      />
    );
  }

  return null;
};

export default Player;

