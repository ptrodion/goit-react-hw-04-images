import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { GlobalStyle } from './GlobalStyle';
import toast, { Toaster } from 'react-hot-toast';
import { Layout } from './Layout';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { LoadMoreButton } from './LoadMoreButton/LoadMoreButton';
import { fetchImages } from './Api/api';
import { Loader } from './Loader/Loader';
import { Error } from './Error/Error';
import { Modal } from './Modal/Modal';

export const App = () => {
  const scrollLoadMoreButtonRef = useRef();

  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [largePhotoURL, setLargePhotoURL] = useState('');

  useEffect(() => {
    if (!query) {
      return;
    }

    setLoading(true);
    setError(false);

    setTimeout(async () => {
      console.log(loading);
      console.log(page);
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
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 5000);
  }, [page, query]);

  const handlerSearchImages = query => {
    setImages([]);
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

  const handlerOpenModal = () => {
    setShowModal(true);
  };

  const handlerCloseModal = () => {
    setShowModal(false);
  };

  const handlerGetLargePhotoURL = value => {
    setLargePhotoURL(value);
  };

  const handlerLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  useLayoutEffect(() => {
    scrollToLoadMoreButton();
  }, []);

  const scrollToLoadMoreButton = () => {
    console.log('I`m here');
    // const { top } = scrollLoadMoreButtonRef.current.getBoundingClientRect();
    // window.scrollTo({
    //   top,
    //   behavior: 'smooth',
    // });
  };

  return (
    <Layout>
      <Searchbar onSearch={handlerSearchImages} />
      {page === 0 && loading && <Loader />}

      {error && <Error message={'What went wrong, try again.'} />}

      {images.length > 0 && (
        <>
          <ImageGallery
            images={images}
            handlerGetLargePhotoURL={handlerGetLargePhotoURL}
            handlerOpenModal={handlerOpenModal}
          />
          <LoadMoreButton
            clickLoadMore={handlerLoadMore}
            ref={scrollLoadMoreButtonRef}
            loading={loading}
          />
        </>
      )}
      {showModal && (
        <Modal largePhotoURL={largePhotoURL} onCloseModal={handlerCloseModal} />
      )}
      <GlobalStyle />
      <Toaster position="top-right" reverseOrder={false} />
    </Layout>
  );
};
