
import Notiflix from 'notiflix';
import templateCard from './templates/card.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import FetchSearchImages from './js/images-api';


const searchForm = document.querySelector('#search-form');
const gallary = document.querySelector('.gallery');


const fetchSearch = new FetchSearchImages();

const observer = new IntersectionObserver(
  (entries, observer) => {
    if (entries[0].isIntersecting) {
      loadMoreData();
    }
  },
  {
    root: null,
    rootMargin: '600px',
    threshold: 1,
  }
);

searchForm.addEventListener('submit', onSearchFormSubmit);

const libraryLithBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});


async function onSearchFormSubmit(event) {
  event.preventDefault();

  
  fetchSearch.query = event.currentTarget.elements.searchQuery.value;

  fetchSearch.resetPage();

  try {
    
    const response = await fetchSearch.fetchSearchImages();

    
    if (response.data.hits.length === 0) {
      gallary.innerHTML = '';

      event.target.reset();
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
  
    let totalImages = response.data.totalHits;
    Notiflix.Notify.info(`Hooray! We found ${totalImages} images`);
    

    fetchSearch.totalHits = response.data.totalHits;

  
    gallary.innerHTML = templateCard(response.data.hits);

    observer.observe(document.querySelector('.target-element'));
    
    libraryLithBox.refresh();
    
  } catch (error) {
    console.log(error);
  }
}

function renderCards(data) {
  const card = templateCard(data);
  gallary.insertAdjacentHTML('beforeend', card);
  libraryLithBox.refresh();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}


async function loadMoreData(event) {
  try {
  
    if (!fetchSearch.isNextDataExsist()) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results"
      );
      observer.unobserve(document.querySelector('.target-element'));
      return;
    }

    const response = await fetchSearch.fetchSearchImages();
    
    renderCards(response.data.hits);
  } catch (error) {
    console.log(error);
  }
}
