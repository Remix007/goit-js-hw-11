//Импортируем библиотеки, темплейты и наш класс
import Notiflix from 'notiflix';
import templateCard from './templates/card.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import FetchSearchImages from './js/images-api';


const searchForm = document.querySelector('#search-form');
const loadMore = document.querySelector('.load-more');
const gallary = document.querySelector('.gallery');


const fetchSearch = new FetchSearchImages();


searchForm.addEventListener('submit', onSearchFormSubmit);
loadMore.addEventListener('click', onClickLoadMore);


const libraryLithBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});


async function onSearchFormSubmit(event) {
  event.preventDefault();
  
  loadMore.classList.add('is-hidden');
  
  fetchSearch.query = event.currentTarget.elements.searchQuery.value;
  
  fetchSearch.resetPage();

  try {
    const response = await fetchSearch.fetchSearchImages();
    console.log('~ response', response);

    if (response.data.hits.length === 0) {
      gallary.innerHTML = '';
      loadMore.classList.add('is-hidden');
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
    if (fetchSearch.isNextDataExsist()) {
      loadMore.classList.remove('is-hidden');
    } else {
      loadMore.classList.add('is-hidden');
    }
    console.log(fetchSearch.isNextDataExsist());
  
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


async function onClickLoadMore(event) {
  try {
    
    if (!fetchSearch.isNextDataExsist()) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results"
      );
      
      loadMore.classList.add('is-hidden');
      return;
    }

    const response = await fetchSearch.fetchSearchImages();
  
    renderCards(response.data.hits);
    
    smoothScroll();
  } catch (error) {
    console.log(error);
  }
}
