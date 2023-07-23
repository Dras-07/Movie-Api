

const apiKey = '66f2b13e'; 
let currentPage = 1;
let movieDetailsVisible = false;

function searchMovies(event) {
  event.preventDefault();
  const movieTitle = document.getElementById('movieSearchInput').value.trim();

  if (movieTitle === '') {
    alert('Please enter a movie title to search.');
    return;
  }

 
  const url = `https://omdbapi.com/?s=${encodeURIComponent(movieTitle)}&page=${currentPage}&apikey=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.Response === 'True') {
        displayResults(data.Search);
        displayPagination(data.totalResults);
      } else {
        alert('No movies found with the given title.');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

function displayResults(movies) {
  const searchResultsDiv = document.getElementById('searchResults');


  searchResultsDiv.innerHTML = '';

  movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');

    movieDiv.innerHTML = `
      <h2 class="movie-title" data-imdb-id="${movie.imdbID}">${movie.Title} (${movie.Year})</h2>
      <img src="${movie.Poster}" alt="${movie.Title} Poster">
      <button class="show-details-button">Show Details</button>
      <div class="movie-details"></div>
    `;

    const showDetailsButton = movieDiv.querySelector('.show-details-button');

    showDetailsButton.addEventListener('click', () => {
      const movieDetailsDiv = movieDiv.querySelector('.movie-details');
      if (!movieDetailsVisible) {
        movieDetailsVisible = true;
        fetchMovieDetails(movie.imdbID)
          .then(details => {
            renderMovieDetails(details, movieDetailsDiv, movie.imdbID);
          })
          .catch(error => {
            console.error('Error fetching movie details:', error);
          });
        showDetailsButton.textContent = 'Hide Details';
      } else {
        movieDetailsDiv.innerHTML = '';
        movieDetailsVisible = false;
        showDetailsButton.textContent = 'Show Details'; 
      }
    });

    searchResultsDiv.appendChild(movieDiv);
  });
}

function displayPagination(totalResults) {
  const paginationDiv = document.getElementById('pagination');
  const totalPages = Math.ceil(totalResults / 10);


  paginationDiv.innerHTML = '';

 
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      searchMovies(new Event('submit'));
    }
  });
  paginationDiv.appendChild(prevButton);


  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.disabled = i === currentPage;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      searchMovies(new Event('submit'));
    });
    paginationDiv.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      searchMovies(new Event('submit'));
    }
  });
  paginationDiv.appendChild(nextButton);
}

function fetchMovieDetails(imdbID) {
  const url = `https://omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
  return fetch(url)
    .then(response => response.json());
}

function renderMovieDetails(movie, movieDetailsDiv, imdbID) {
  movieDetailsDiv.innerHTML = `
    <h2>${movie.Title} (${movie.Year})</h2>
    <p>Released: ${movie.Released}</p>
    <p>Runtime: ${movie.Runtime}</p>
    <p>Genre: ${movie.Genre}</p>
    <p>Director: ${movie.Director}</p>
    <p>Actors: ${movie.Actors}</p>
    <p>Plot: ${movie.Plot}</p>
    <div class="comment-section">
      <label for="comment-${imdbID}">Comment:</label>
      <input type="text" id="comment-${imdbID}" placeholder="Enter your comment...">
      <button class="add-comment-button">Add Comment</button>
      <div class="user-comments"></div>
    </div>
    <div class="ratings-section">
      <label for="rating-${imdbID}">Rating:</label>
      <select id="rating-${imdbID}">
        <option value="1"></option>
        <option value="2">⭐</option>
        <option value="3">⭐⭐</option>
        <option value="4">⭐⭐⭐</option>
        <option value="5">⭐⭐⭐⭐</option>
        <option value="6">⭐⭐⭐⭐⭐</option>
      </select>
      <button class="update-rating-button">Add/Update Rating</button>
      <p class="user-rating"></p>
    </div>
  `;

  const addCommentButton = movieDetailsDiv.querySelector('.add-comment-button');
  const updateRatingButton = movieDetailsDiv.querySelector('.update-rating-button');
  const commentInput = movieDetailsDiv.querySelector(`#comment-${imdbID}`);
  const ratingInput = movieDetailsDiv.querySelector(`#rating-${imdbID}`);
  const userCommentsDiv = movieDetailsDiv.querySelector('.user-comments');
  const userRatingDisplay = movieDetailsDiv.querySelector('.user-rating');


  const storedComments = JSON.parse(localStorage.getItem(`comments-${imdbID}`)) || [];
  const storedRating = localStorage.getItem(`rating-${imdbID}`);

  if (storedComments.length > 0) {
    storedComments.forEach(comment => {
      const commentDisplay = document.createElement('p');
      commentDisplay.textContent = `User Comment 🗨️: ${comment}`;
      userCommentsDiv.appendChild(commentDisplay);
    });
  }

  if (storedRating) {
    ratingInput.value = storedRating;
    userRatingDisplay.textContent = `User Rating: ${'⭐'.repeat(storedRating)}`;
  }

  addCommentButton.addEventListener('click', () => {
    const comment = commentInput.value.trim();

    if (comment !== '') {
      const commentDisplay = document.createElement('p');
      commentDisplay.textContent = `User Comment 🗨️: ${comment}`;
      userCommentsDiv.appendChild(commentDisplay);
      commentInput.value = '';

     
      const comments = storedComments.concat(comment);
      localStorage.setItem(`comments-${imdbID}`, JSON.stringify(comments));
    }
  });

  updateRatingButton.addEventListener('click', () => {
    const rating = ratingInput.value;
    userRatingDisplay.textContent = `User Rating: ${'⭐'.repeat(rating)}`;

   
    localStorage.setItem(`rating-${imdbID}`, rating);
  });
}


const movieSearchForm = document.getElementById('movieSearchForm');
movieSearchForm.addEventListener('submit', searchMovies);


searchMovies(new Event('submit'));
