import { newId } from "./rng";

const parseCardTextLine = (line) => {
  const spaceIndex = line.indexOf(" ");
  const count = parseInt(line.slice(0, spaceIndex));
  const postSpace = line.slice(spaceIndex + 1);
  const name = postSpace.match(/(.*) \/\/ .*/)?.[1] ?? postSpace;
  return {
    count,
    name,
  };
};

export const parseDecklist = (text) => {
  // Moxfield had the quickest format to import
  // MTGO format
  // assume each line is a card listing
  // main deck first
  // then blank line
  // then commander
  const sections = text
    .split("\n\n")
    .filter((section) => !section.startsWith("SIDEBOARD:"))
    .map((section) => section.split("\n").map(parseCardTextLine));
  const deck = sections.reduce(
    (prev, cur) => (cur.length > prev.length ? cur : prev),
    sections[0]
  );
  const commanders = sections.reduce(
    (prev, cur) => (cur.length < prev.length ? cur : prev),
    sections[0]
  );

  // const commander = parseCardTextLine(sections[1]);
  console.log({ deck, commanders });
  return { commanders, deck };
};

const requestCards = async (cards) => {
  const identifiers = cards.map((card) => ({
    name: card.name,
  }));

  const result = await fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifiers,
    }),
  }).then((response) => response.json());

  return result?.data ?? [];
};

export const requestDecklist = async (commanders, deck) => {
  console.log("requesting deck", { commanders, deck });

  // scryfall api limits us to 75 cards at a time
  const deckChunks = chunkArray(deck, 75);

  let deckResults = [];
  for (let i = 0; i < deckChunks.length; i++) {
    const results = await requestCards(deckChunks[i]);
    deckResults.push(...results);
    // scryfall api limits requests to 1/100ms
    await delay(150);
  }

  const commandResult = await requestCards(commanders);

  const deckCards = deck.flatMap((item, index) => {
    return createCards(deckResults[index], item.count);
  });

  const commanderCards = commanders.flatMap((item, index) => {
    return createCards(commandResult[index], item.count);
  });

  return { deck: deckCards, commanders: commanderCards };
};

const createCards = (scryfallCard, count) => {
  return [...new Array(count)].map((_) => createCard(scryfallCard));
};

const createCard = (scryfallCard) => {
  return {
    id: newId(),
    name: scryfallCard.name,
    faces: scryfallCard.card_faces
      ? scryfallCard.card_faces.map((face) => ({ image_uris: face.image_uris }))
      : [{ image_uris: scryfallCard.image_uris }],
  };
};

const delay = (millisec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, millisec);
  });
};

const chunkArray = (array, length) => {
  const numChunks = Math.ceil(array.length / length);
  let chunks = [];
  for (let i = 0; i < numChunks; i++) {
    const offset = i * length;
    chunks.push(array.slice(offset, offset + length));
  }
  return chunks;
};
