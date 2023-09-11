import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { GlobalStyle } from './GlobalStyle';
import toast, { Toaster } from 'react-hot-toast';
import { Layout } from './Layout';
import { Searchbar } from './Searchbar/Searchbar';
import { LoadMoreButton } from './LoadMoreButton/LoadMoreButton';
import { fetchImages } from './Api/api';
import { Loader } from './Loader/Loader';
import { Error } from './Error/Error';
import { CustomModal } from './Modal/Modal';
import {
  ImageGalleryLi,
  ImageGalleryUl,
  ImageGalleryUlImg,
} from './ImageGallery/ImageGallery.styled';

export const App = () => {
  const scrollLoadMoreButtonRef = useRef();

  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isShowModal, setShowModal] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [image, setImage] = useState({ src: '', alt: '' });

  useEffect(() => {
    if (!query) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const currentQuery = String(query.split('/')[1]);
        const response = await fetchImages(currentQuery, page);

        const { totalHits: totalImages, hits: data } = response;

        if (totalImages === 0) {
          toast.error('Nothing found for this query.');
          setImages([]);
          setQuery('');
        } else {
          setImages(prevState => [...prevState, ...data]);
          setIsLoadMore(page < Math.ceil(totalImages / 12));
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, query]);

  const onSubmit = query => {
    setImages([]);
    setIsLoadMore(false);
    if (query) {
      setQuery(`${Date.now()}/${query}`);
      setPage(1);
    } else {
      setQuery('');
      setPage(0);
      toast('Fill in the search word', {
        icon: '👈',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  const openModal = (src, alt) => {
    setShowModal(prevState => !prevState);
    setImage({ src, alt });
  };

  const handlerLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  useLayoutEffect(() => {
    scrollToLoadMoreButton();
  }, []);

  const scrollToLoadMoreButton = () => {
    // console.log('I`m here');
    // const { top } = scrollLoadMoreButtonRef.current.getBoundingClientRect();
    // window.scrollTo({
    //   top,
    //   behavior: 'smooth',
    // });
  };

  return (
    <Layout>
      <Searchbar onSubmit={onSubmit} />
      {page === 0 && isLoading && <Loader />}

      {isError && <Error message={'What went wrong, try again.'} />}

      {images.length > 0 && (
        <>
          <ImageGalleryUl>
            {images.map(({ id, webformatURL, tags, largeImageURL }) => (
              <ImageGalleryLi key={id}>
                <ImageGalleryUlImg
                  src={webformatURL}
                  alt={tags}
                  width="350"
                  onClick={() => {
                    openModal(largeImageURL, tags);
                  }}
                />
              </ImageGalleryLi>
            ))}
          </ImageGalleryUl>

          {isLoadMore && (
            <LoadMoreButton
              clickLoadMore={handlerLoadMore}
              ref={scrollLoadMoreButtonRef}
              loading={isLoading}
            />
          )}
        </>
      )}
      {isShowModal && (
        <CustomModal
          modalIsOpen={isShowModal}
          src={image.src}
          alt={image.alt}
          closeModal={openModal}
        />
      )}
      <GlobalStyle />
      <Toaster position="top-right" reverseOrder={false} />
    </Layout>
  );
};
