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
import { ImageGallery } from './ImageGallery/ImageGallery';

export const App = () => {
  const scrollLoadMoreButtonRef = useRef(null);

  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isShowModal, setShowModal] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [largePhotoURL, setLargePhotoURL] = useState('');
  const [description, setDescription] = useState('');

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

  const handlerLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  useEffect(() => {
    const buttonRef = scrollLoadMoreButtonRef.current;
    if (images.length && page !== 1) {
      window.scrollTo({
        top: buttonRef.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [images, page]);

  const openModal = () => {
    setShowModal(prevState => !prevState);
  };

  const handlerGetLargePhotoURL = value => {
    setLargePhotoURL(value);
  };

  const handlerGetDescription = value => {
    setDescription(value);
  };

  return (
    <Layout>
      <Searchbar onSubmit={onSubmit} />
      {page === 0 && isLoading && <Loader />}

      {isError && <Error message={'What went wrong, try again.'} />}

      {images.length > 0 && (
        <>
          <ImageGallery
            images={images}
            handlerGetLargePhotoURL={handlerGetLargePhotoURL}
            handlerGetAlt={handlerGetDescription}
            handlerOpenModal={openModal}
          />

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
          src={largePhotoURL}
          alt={description}
          closeModal={openModal}
        />
      )}
      <GlobalStyle />
      <Toaster position="top-right" reverseOrder={false} />
    </Layout>
  );
};
