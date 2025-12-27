import { useState, useEffect } from 'react';
import css from './App.module.css';
import NoteList from '../NoteList/NoteList';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import { useFetchNotes } from '../../services/noteService';
import toast, { Toaster } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import NoteForm from '../NoteForm/NoteForm';
import Pagination from '../Pagination/Pagination';

export default function App() {
  //! 🔹 States
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawSearch, setRawSearch] = useState('');

  //! 🔹 Debounced search
  const [debouncedSearch] = useDebounce(rawSearch, 300);

  const handleSearchChange = (value: string) => {
    setRawSearch(value);
    setCurrentPage(1);
  };

  //! 🔹 Modal
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  //! 🔹 Notes Response
  const { data, isSuccess, isLoading, isError } = useFetchNotes(
    currentPage,
    debouncedSearch
  );

  //! 🔹 Handle "no notes found"
  useEffect(() => {
    if (
      isSuccess &&
      data &&
      Array.isArray(data.notes) &&
      data.notes.length === 0
    ) {
      toast.error('No notes found.');
    }
  }, [isSuccess, data]);

  //! 🔹 Render
  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={e => handleSearchChange(e.target.value)} />
        {data?.totalPages && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        <button onClick={openModal} className={css.button}>
          Create note +
        </button>
      </header>
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {data && Array.isArray(data.notes) && data.notes.length > 0 && (
        <NoteList notes={data.notes} />
      )}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={closeModal} />
        </Modal>
      )}
      <Toaster />
    </div>
  );
}
