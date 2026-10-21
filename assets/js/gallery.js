document.querySelectorAll('.gallery-masonry').forEach((grid) => {
  imagesLoaded(grid, () => {
    new Masonry(grid, { itemSelector: '.gallery-item', percentPosition: true });
  });
});
