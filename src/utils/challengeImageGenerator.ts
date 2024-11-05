export default function getChallengeImage() {
  var images = [
    '/planet-01.png',
    '/planet-02.png',
    '/planet-03.png',
    '/planet-04.png',
    '/planet-05.png',
    '/planet-06.png',
    '/planet-07.png',
    '/planet-08.png',
    '/planet-09.png',
  ];

  var randomIndex = Math.floor(Math.random() * images.length);

  return images[randomIndex];
}
