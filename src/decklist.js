import { newId } from './rng';

const parseCardTextLine = (line) => {
  const spaceIndex = line.indexOf(' ');
  return {
    count: parseInt(line.slice(0, spaceIndex)),
    name: line.slice(spaceIndex + 1),
  };
};

export const parseDecklist = (text) => {
  // Moxfield had the quickest format to import
  // MTGO format
  // assume each line is a card listing
  // main deck first
  // then blank line
  // then commander
  const sections = text.split('\n\n');
  const deck = sections[0].split('\n').map(parseCardTextLine);
  const commanders = sections[1].split('\n').map(parseCardTextLine);
  // const commander = parseCardTextLine(sections[1]);
  console.log({ deck, commanders });
  return { commanders, deck };
};

export const requestDecklist = async (commanders, deck) => {
  console.log('requesting deck', { commanders, deck });

  let identifiers = [];

  // scryfall api limits us to 75 cards at a time
  identifiers = deck.slice(0, 75).map((card) => ({
    name: card.name,
  }));

  const result = await fetch('https://api.scryfall.com/cards/collection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      identifiers,
    }),
  }).then((response) => response.json());

  // scryfall api limits requests to 1/100ms
  await delay(150);

  identifiers = deck.slice(75).map((card) => ({
    name: card.name,
  }));
  const result2 = await fetch('https://api.scryfall.com/cards/collection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      identifiers,
    }),
  }).then((response) => response.json());

  const deckResults = [...(result?.data ?? []), ...(result2?.data ?? [])];

  // scryfall api limits requests to 1/100ms
  await delay(150);

  identifiers = commanders.map((card) => ({
    name: card.name,
  }));
  const result3 = await fetch('https://api.scryfall.com/cards/collection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      identifiers,
    }),
  }).then((response) => response.json());
  const commandResult = [...(result3?.data ?? [])];

  const deckCards = deck.flatMap((item, index) => {
    const { name, image_uris } = deckResults[index];
    return [...new Array(item.count)].map((_) => ({
      id: newId(),
      name,
      image_uris,
    }));
  });

  const commanderCards = commanders.flatMap((item, index) => {
    const { name, image_uris } = commandResult[index];
    return [...new Array(item.count)].map((_) => ({
      id: newId(),
      name,
      image_uris,
    }));
  });

  return { deck: deckCards, commanders: commanderCards };
};

function delay(millisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, millisec);
  });
}
