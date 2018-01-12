const birds = document.querySelector('#birds');
const newForm = document.querySelector('#newBirdForm');
const BIRDS_URL = 'localhost:8000/birds';

newForm.addEventListener('submit', (e) => {
  e.preventDefault(); // PREVENT DEFAULT ON FORM

  const data = entriesToObject(new FormData(newForm).entries());

  fetch(BIRDS_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.json)
  .then((bird) => {
    const birdEl = document.createElement('div');

    birdEl.innerHTML = `<div>
      <h2>  ${bird.title} </h2>
      <p>  ${bird.description} </p>
    </div>`;

    birds.append(birdEl);

    newForm.clear();
  })
});

function entriesToObject(entries) {
  return [...entries].reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
}
