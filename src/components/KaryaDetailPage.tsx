import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Download, Play, X } from 'lucide-react';
import {
  KARYA_GALLERIES,
  KARYA_GALLERY_TABS,
  type KaryaGallerySlug,
  toVideoEmbedSrc,
  toVideoThumbSrc,
} from '../data/karyaGalleries';
import { SILKY_EASE } from './SmoothMotion';

interface KaryaDetailPageProps {
  slug: KaryaGallerySlug;
  onSelectGallery: (slug: KaryaGallerySlug) => void;
  onBackToKarya: () => void;
}

export function KaryaDetailPage({
  slug,
  onSelectGallery,
  onBackToKarya,
}: KaryaDetailPageProps) {
  const gallery = KARYA_GALLERIES[slug];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    setLightboxIdx(null);
  }, [slug]);

  const totalLightboxItems =
    gallery.kind === 'infografis'
      ? gallery.images.length
      : gallery.kind === 'aplikasi'
        ? gallery.screenshots.length
        : gallery.kind === 'vlog'
          ? gallery.videos.length
          : 0;

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft' && totalLightboxItems > 0) {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + totalLightboxItems) % totalLightboxItems
        );
      }
      if (e.key === 'ArrowRight' && totalLightboxItems > 0) {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % totalLightboxItems));
      }
    };
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIdx, totalLightboxItems]);

  return (
    <>
      <header className="subpage-hero">
        <div className="hero-stars" aria-hidden="true">
          <span className="star-dot s1" />
          <span className="star-dot s2" />
          <span className="star-dot s5" />
        </div>
        <div className="container subpage-hero-inner">
          <div className="subpage-breadcrumb">
            <button type="button" className="subpage-back-btn" onClick={onBackToKarya}>
              ← Kembali ke Karya Siswa
            </button>
            <span className="subpage-crumb-trail">
              Home / Karya Siswa / {gallery.kategori}
            </span>
          </div>
          <div className="eyebrow eyebrow-gold">Galeri Karya · {gallery.kategori}</div>
          <h1 className="subpage-title">{gallery.title}</h1>
          <p className="subpage-sub">{gallery.desc}</p>

          <div className="karya-detail-meta-row">
            <span className="karya-detail-chip">📘 {gallery.mapel}</span>
            <span className="karya-detail-chip">🎓 {gallery.kelas}</span>
            {'by' in gallery && gallery.by ? (
              <span className="karya-detail-chip">👤 {gallery.by}</span>
            ) : null}
            {gallery.kind === 'infografis' ? (
              <span className="karya-detail-chip">🖼️ {gallery.images.length} Karya Infografis</span>
            ) : null}
            {gallery.kind === 'vlog' ? (
              <span className="karya-detail-chip">🎥 {gallery.videos.length} Video Vlog</span>
            ) : null}
          </div>

          <div className="subpage-switcher">
            {KARYA_GALLERY_TABS.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                className={`subpage-pill${tab.slug === slug ? ' active' : ''}`}
                onClick={() => onSelectGallery(tab.slug)}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section id="karya-detail" className="subpage-body">
        <div className="container">
          {gallery.kind === 'infografis' ? (
            <div className="karya-infografis-grid">
              {gallery.images.map((item, idx) => (
                <motion.button
                  key={item.src}
                  type="button"
                  className="karya-gal-card"
                  onClick={() => setLightboxIdx(idx)}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -5, transition: { duration: 0.22, ease: SILKY_EASE } }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx * 0.045, 0.36),
                    ease: SILKY_EASE,
                  }}
                >
                  <div className="karya-gal-img-wrap">
                    <img src={item.src} alt={item.title} loading="lazy" />
                    <span className="karya-gal-zoom">Perbesar ↗</span>
                  </div>
                  <div className="karya-gal-caption">
                    <h4>{item.title}</h4>
                    <p>
                      {item.by} · {item.kelas}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : gallery.kind === 'aplikasi' ? (
            <div className="karya-app-showcase">
              <motion.div
                className="karya-app-hero-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: SILKY_EASE }}
              >
                <div className="karya-app-badge-row">
                  <div className="karya-app-icon">📱</div>
                  <div>
                    <div className="karya-app-tagline">{gallery.tagline}</div>
                    <h2>{gallery.title}</h2>
                    <p className="karya-app-creator">
                      Dikembangkan oleh <strong>{gallery.by}</strong> · {gallery.kelas}
                    </p>
                  </div>
                </div>
                <div className="karya-app-dl-wrap">
                  <a
                    href={gallery.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <Download size={17} />
                    <span>Unduh Aplikasi (APK)</span>
                  </a>
                  <small>{gallery.downloadHint}</small>
                </div>
              </motion.div>

              <motion.div
                className="karya-app-features-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: SILKY_EASE }}
              >
                <h3>Fitur Utama Aplikasi</h3>
                <div className="karya-app-features-grid">
                  {gallery.features.map((feat, idx) => (
                    <div key={idx} className="karya-app-feature-item">
                      <span className="karya-feature-check">
                        <Check size={15} />
                      </span>
                      <p>{feat}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="karya-app-shots-section">
                <h3>Tampilan Layar Aplikasi (Klik untuk Perbesar)</h3>
                <div className="karya-app-shots-grid">
                  {gallery.screenshots.map((shot, idx) => (
                    <motion.button
                      key={shot.src}
                      type="button"
                      className="karya-phone-card"
                      onClick={() => setLightboxIdx(idx)}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{ y: -5, transition: { duration: 0.22, ease: SILKY_EASE } }}
                      transition={{
                        duration: 0.45,
                        delay: 0.12 + idx * 0.06,
                        ease: SILKY_EASE,
                      }}
                    >
                      <div className="karya-phone-frame">
                        <div className="karya-phone-notch" />
                        <img src={shot.src} alt={shot.caption} loading="lazy" />
                      </div>
                      <span className="karya-phone-caption">{shot.caption}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : gallery.kind === 'video-proses' ? (
            <div className="karya-video-compare-grid">
              <motion.div
                className="karya-video-slot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: SILKY_EASE }}
              >
                <div className="karya-video-label proses">🎬 Video Proses Pembuatan</div>
                <div className="karya-video-frame">
                  <video controls preload="metadata" src={gallery.videoProses} />
                </div>
              </motion.div>
              <motion.div
                className="karya-video-slot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: SILKY_EASE }}
              >
                <div className="karya-video-label hasil">✅ Video Hasil Jadi</div>
                <div className="karya-video-frame">
                  <video controls preload="metadata" src={gallery.videoHasil} />
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="karya-vlog-grid">
              {gallery.videos.map((v, idx) => {
                const thumb = toVideoThumbSrc(v.url);
                return (
                  <motion.button
                    key={v.url}
                    type="button"
                    className="karya-vlog-card"
                    onClick={() => setLightboxIdx(idx)}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -5, transition: { duration: 0.22, ease: SILKY_EASE } }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(idx * 0.06, 0.35),
                      ease: SILKY_EASE,
                    }}
                  >
                    <div className="karya-vlog-thumb">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={v.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="karya-vlog-play" aria-hidden="true">
                        <Play size={22} fill="currentColor" />
                      </span>
                    </div>
                    <div className="karya-vlog-caption">
                      <h4>{v.title}</h4>
                      <p>{v.by}</p>
                      <small>{v.kelas}</small>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightboxIdx !== null && totalLightboxItems > 0 ? (
          <motion.div
            className="karya-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxIdx(null);
            }}
          >
            <button
              type="button"
              className="karya-lb-close"
              aria-label="Tutup pratinjau"
              onClick={() => setLightboxIdx(null)}
            >
              <X size={20} />
            </button>
            {totalLightboxItems > 1 ? (
              <button
                type="button"
                className="karya-lb-nav prev"
                aria-label="Sebelumnya"
                onClick={() =>
                  setLightboxIdx((lightboxIdx - 1 + totalLightboxItems) % totalLightboxItems)
                }
              >
                <ChevronLeft size={24} />
              </button>
            ) : null}

            <div className="karya-lb-content">
              {gallery.kind === 'infografis' ? (
                <>
                  <img
                    src={gallery.images[lightboxIdx].src}
                    alt={gallery.images[lightboxIdx].title}
                    className="karya-lb-img"
                  />
                  <div className="karya-lb-caption">
                    {gallery.images[lightboxIdx].title} · {gallery.images[lightboxIdx].by} (
                    {lightboxIdx + 1}/{totalLightboxItems})
                  </div>
                </>
              ) : gallery.kind === 'aplikasi' ? (
                <>
                  <img
                    src={gallery.screenshots[lightboxIdx].src}
                    alt={gallery.screenshots[lightboxIdx].caption}
                    className="karya-lb-img"
                  />
                  <div className="karya-lb-caption">
                    {gallery.screenshots[lightboxIdx].caption} ({lightboxIdx + 1}/
                    {totalLightboxItems})
                  </div>
                </>
              ) : gallery.kind === 'vlog' ? (
                <>
                  <div className="karya-lb-video-frame">
                    <iframe
                      src={toVideoEmbedSrc(gallery.videos[lightboxIdx].url)}
                      title={gallery.videos[lightboxIdx].title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="karya-lb-caption">
                    {gallery.videos[lightboxIdx].title} · {gallery.videos[lightboxIdx].by}
                  </div>
                </>
              ) : null}
            </div>

            {totalLightboxItems > 1 ? (
              <button
                type="button"
                className="karya-lb-nav next"
                aria-label="Berikutnya"
                onClick={() => setLightboxIdx((lightboxIdx + 1) % totalLightboxItems)}
              >
                <ChevronRight size={24} />
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
