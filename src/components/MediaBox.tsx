import { useState } from 'react';

interface MediaBoxProps {
  image?: string;
  gradClass: string;
  emoji: string;
  badgeText?: string;
  heightClass: 'media-h-130' | 'media-h-160' | 'media-h-190' | 'media-h-220';
}

export function MediaBox({ image, gradClass, emoji, badgeText, heightClass }: MediaBoxProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const showImage = Boolean(image) && !imgFailed;

  return (
    <div className={`media-box ${heightClass} ${gradClass}`}>
      {showImage ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className={imgLoaded ? 'media-img-loaded' : 'media-img-loading'}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="media-fallback">
          <span>{emoji}</span>
        </div>
      )}
      {badgeText ? <span className="badge">{badgeText}</span> : null}
    </div>
  );
}

export function CardMediaImage({ src }: { src?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  if (!src || imgFailed) return null;

  return (
    <img
      className={`card-media ${imgLoaded ? 'media-img-loaded' : 'media-img-loading'}`}
      src={src}
      alt=""
      loading="lazy"
      onLoad={() => setImgLoaded(true)}
      onError={() => setImgFailed(true)}
    />
  );
}
