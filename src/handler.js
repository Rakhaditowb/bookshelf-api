const Hapi = require('@hapi/hapi');
let nanoid;
(async () => {
  const { nanoid: nanoidImport } = await import('nanoid');
  nanoid = nanoidImport;
})()

const books = require('./books');

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };
  books.push(newBook);

  return h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id,
    },
  }).code(201);
};

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;
  
    let filteredBooks = books;
  
    if (name) {
      filteredBooks = filteredBooks.filter((book) => 
        book.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (reading) {
      const isReading = reading === '1';
      filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    if (finished) {
      const isFinished = finished === '1';
      filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }
  
    const response = h.response({
      status: 'success',
      data: {
        books: filteredBooks.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  };

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    }).code(404);
  }

  return {
    status: 'success',
    data: { book },
  };
};

const updateBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const index = books.findIndex((b) => b.id === bookId);

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }
  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  books[index] = {
    ...books[index],
    name, year, author, summary, publisher, pageCount, readPage, reading,
    finished: pageCount === readPage,
    updatedAt: new Date().toISOString(),
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((b) => b.id === bookId);

  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }

  books.splice(index, 1);
  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
