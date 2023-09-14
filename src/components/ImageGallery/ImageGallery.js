import { GalleryItems } from 'components/ImageGalleryItem/ImageGalleryItem';
import { ImageGallerySt } from './ImageGallery.styled';

export const ImageGallery = ({
  images,
  handlerGetLargePhotoURL,
  handlerGetAlt,
  handlerOpenModal,
}) => {
  return (
    <ImageGallerySt>
      {images.map(({ id, ...images }) => (
        <GalleryItems
          key={id}
          images={images}
          handlerGetLargePhotoURL={handlerGetLargePhotoURL}
          handlerGetAlt={handlerGetAlt}
          handlerOpenModal={handlerOpenModal}
        ></GalleryItems>
      ))}
    </ImageGallerySt>
  );
};
