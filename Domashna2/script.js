var cards = [
  { name: "1", img: "img1.png" },
  { name: "2", img: "img2.png" },
  { name: "3", img: "img3.png" },
  { name: "4", img: "img4.png" },
  { name: "5", img: "img5.png" },
  { name: "6", img: "img6.png" }
];

var gameCards = cards.concat(cards);
var firstCard = null;
var secondCard = null;
var lockBoard = false;
var tries = 0;
var matchedPairs = 0;

function shuffle(array) {
  array.sort(function() { return 0.5 - Math.random(); });
  return array;
} 


function start() {
  shuffle(gameCards);

  var board = document.getElementById("board");
  board.innerHTML = ""; 
  
  for (var i = 0; i < gameCards.length; i++) {
    var card = document.createElement("img");
    card.setAttribute("src", "back.png");
    card.setAttribute("data-name", gameCards[i].name);
    card.className = "card";
    card.addEventListener("click", flipCard, false);
    board.appendChild(card);
  }

  document.getElementById("tries").innerHTML = "Број на обиди: 0";
}


function flipCard() {
  if (lockBoard || this === firstCard) {
    return;
  }

  var name = this.getAttribute("data-name");
  var cardData = null;

  for (var i = 0; i < gameCards.length; i++) {
    if (gameCards[i].name === name) {
      cardData = gameCards[i];
      break;
    }
  }

  this.setAttribute("src", cardData.img);

  if (firstCard === null) {
    firstCard = this;
  } else {
    secondCard = this;
    tries++;
    document.getElementById("tries").innerHTML = "Број на обиди: " + tries;
    checkMatch();
  }
}


function checkMatch() {
  if (firstCard.getAttribute("data-name") === secondCard.getAttribute("data-name")) {
    firstCard.removeEventListener("click", flipCard, false);
    secondCard.removeEventListener("click", flipCard, false);
    matchedPairs++;
    resetBoard();

    if (matchedPairs === cards.length) {
      alert("Браво! Ги најде сите парови за " + tries + " обиди!");
    }
  } else {
    lockBoard = true;
    setTimeout(unflipCards, 1000);
  }
}


function unflipCards() {
  firstCard.setAttribute("src", "back.png");
  secondCard.setAttribute("src", "back.png");
  resetBoard();
}


function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}


window.addEventListener("load", start, false);
