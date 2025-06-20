// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-FTB-ET-WEB-PT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// Adds party to the party list and confirms with API
async function postParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(party),
    });
    if (response.ok) {
      init();
    }
  } catch (err) {
    console.error(err);
  }
}

// Deletes party from the list and API
async function deleteParty(id) {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    if (response.ok) {
      init();
    }
  } catch (err) {
    console.error(err);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <DeleteButton></DeleteButton>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector("DeleteButton").replaceWith(DeleteParty());

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find((rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id)
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// Button that deletes party
function DeleteParty() {
  const $button = document.createElement("button");
  $button.textContent = "Delete Party";
  $button.addEventListener("click", () => {
    deleteParty(selectedParty.id);
  });
  return $button;
}

/** Form to add an event to the API */
function AdminTool() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label for="name">Name</label>
    <input name="name" placeholder="name" />
    <label for="description">Description</label>
    <input name="description" placeholder="description" />
    <label for="date">Date</label>
    <input type="date" name="date" placeholder="mm/dd/yyyy" />
    <label for="location">Location</label>
    <input name="location" placeholder="location" />
    <button>Add party</button>
  `;

  $form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);

    // Test to see if any input data is missing and return if missing.
    for (const [key, value] of formData) {
      if (value === "") {
        console.error(`${key} is missing`);
        // return;
      }
    }

    // call function that adds party info to API
    postParty({
      name: formData.get("name"),
      description: formData.get("description"),
      date: new Date(formData.get("date")).toISOString(),
      location: formData.get("location"),
    });
  });
  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h3>Add a new party</h3>
        <PartyAdminTool></PartyAdminTool>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("PartyAdminTool").replaceWith(AdminTool());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
