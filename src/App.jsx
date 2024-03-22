import { useState } from "react";
import "./App.css";
import { shuffle } from "./rng";
import { parseDecklist, requestDecklist } from "./decklist";
import Card from "./Card";
import Drawer from "./Drawer";

function App() {
  const [decklistText, setDecklistText] = useState("");

  const [commandZone, setCommandZone] = useState([]);
  const [library, setLibrary] = useState([]);
  const [otherZones, setOtherZones] = useState([]);

  const draw = (n = 1) => {
    if (library.length < n) {
      console.log(
        `Can't draw ${n} cards; there are only ${library.length} left`
      );
      return;
    }

    const cards = library.slice(0, n);

    setLibrary((prev) => prev.slice(n));
    setOtherZones((prev) => [...prev, ...cards]);
  };

  const replace = (card, top = true) => {
    setLibrary((prev) => (top ? [card, ...prev] : [...prev, card]));
    setOtherZones((prev) => prev.filter((c) => c.id !== card.id));
  };

  const shuffleLibrary = () => setLibrary(shuffle(library));

  const fetchDeck = (commanders, deck) => {
    setLibrary([]);
    setCommandZone([]);
    setOtherZones([]);

    const request = async () => {
      return await requestDecklist(commanders, deck);
    };

    request().then((result) => {
      applyFetchedDeck(result);
    });
  };

  const applyFetchedDeck = (result) => {
    setLibrary([...result.deck]);
    setCommandZone([...result.commanders]);
  };

  const onLoadDeck = () => {
    const { commanders, deck } = parseDecklist(decklistText);
    fetchDeck(commanders, deck);
  };

  return (
    <>
      <Drawer label={"Decklist"} defaultOpen={true}>
        {/* Moxfield had the quickest format to import */}
        <textarea
          value={decklistText}
          onChange={(event) => setDecklistText(event.target.value)}
          rows={20}
          cols={80}
          placeholder={`Use https://www.moxfield.com/ decklist -> More -> Export -> Copy for MTGO.\n\nAssumes format is exact; not resilient against errors at all.\n\nEach line should be a card count followed by a space followed by card name. There should be one blank line after main deck, the following lines are interpreted as commanders.`}
        />
      </Drawer>
      <button onClick={() => onLoadDeck()}>Load Deck</button>

      <div>
        <div>
          <h2>Command Zone ({commandZone.length})</h2>
          {commandZone.map((card, index) => (
            <Card
              key={card.id}
              index={index}
              id={card.id}
              name={card.name}
              img={card.faces[0].image_uris.small}
            />
          ))}
        </div>

        <div>
          <h2>Library ({library.length})</h2>
          <div>
            <button onClick={() => draw()}>Draw</button>
          </div>
          <div>
            <button onClick={() => shuffleLibrary()}>Shuffle</button>
          </div>
          <Drawer label="View Library">
            {library.map((card, index) => (
              <Card
                key={card.id}
                index={index}
                id={card.id}
                name={card.name}
                img={card.faces[0].image_uris.small}
              />
            ))}
          </Drawer>
        </div>

        <div>
          <h2>Other Zones ({otherZones.length})</h2>
          {otherZones.map((card, index) => (
            <Card
              key={card.id}
              index={index}
              id={card.id}
              name={card.name}
              img={card.faces[0].image_uris.small}
              onClick={() => {
                replace(card);
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
