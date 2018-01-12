const { body } = document;
  let theta = 0;

  setInterval(() => {
    theta += 1;
    body.style.transform = `rotateX(${theta}deg)`;
  }, 20);
  
