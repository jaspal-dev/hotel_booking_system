// Constants
const FLOORS = 10;
const ROOMS_PER_FLOOR = {
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 10,
  7: 10,
  8: 10,
  9: 10,
  10: 7,
};
const H_STEP = 1; // horizontal distance unit time
const V_STEP = 2; // vertical distance unit time

// Room Model
const rooms = [];
for (let f = 1; f <= FLOORS; f++) {
  const cnt = ROOMS_PER_FLOOR[f];
  for (let i = 0; i < cnt; i++) {
    const num = f === 10 ? 1000 + (i + 1) : f * 100 + (i + 1);
    rooms.push({
      number: num,
      floor: f,
      pos: i,
      occupied: false,
    });
  }
}

const hotelEl = document.getElementById("hotel");
const statusEl = document.getElementById("status");

function draw() {
  hotelEl.innerHTML = "";
  for (let f = FLOORS; f >= 1; f--) {
    const row = document.createElement("div");
    row.className = "floor";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `${String(f).padStart(2, " ")}F`;
    row.appendChild(label);

    const floorRooms = rooms.filter((r) => r.floor === f);
    for (const r of floorRooms) {
      const div = document.createElement("div");
      div.className = `room ${r.occupied ? "occupied" : "vacant"}`;
      div.textContent = r.number;
      row.appendChild(div);
    }
    hotelEl.appendChild(row);
  }
}

draw();

// ------------------------------ Utility helpers ------------------------------
const costOrigin = (r) => r.floor * V_STEP + r.pos * H_STEP; // cheap heuristic

function travelTime(set) {
  const minFloor = Math.min(...set.map((r) => r.floor));
  const maxFloor = Math.max(...set.map((r) => r.floor));
  const minPos = Math.min(...set.map((r) => r.pos));
  const maxPos = Math.max(...set.map((r) => r.pos));
  return (maxFloor - minFloor) * V_STEP + (maxPos - minPos) * H_STEP;
}

// Booking logic
function book(n) {
  // validation
  if (n < 1 || n > 5) {
    statusEl.textContent = "Enter 1 - 5 rooms.";
    return [];
  }

  const vacancies = rooms.filter((r) => !r.occupied);
  if (vacancies.length < n) {
    statusEl.textContent = "Not enough rooms left.";
    return [];
  }

  for (let f = 1; f <= FLOORS; f++) {
    const free = vacancies
      .filter((r) => r.floor === f)
      .sort((a, b) => a.pos - b.pos);
    if (free.length < n) continue;

    let best = null;
    for (let i = 0; i <= free.length - n; i++) {
      const candidate = free.slice(i, i + n);
      const span = candidate.at(-1).pos - candidate[0].pos;
      if (!best || span < best.span) best = { set: candidate, span };
    }
    best.set.forEach((r) => (r.occupied = true));
    return best.set;
  }

  const sorted = vacancies.sort((a, b) => costOrigin(a) - costOrigin(b));
  let bestMulti = null;
  for (let i = 0; i <= sorted.length - n; i++) {
    const slice = sorted.slice(i, i + n);
    const t = travelTime(slice);
    if (!bestMulti || t < bestMulti.t) bestMulti = { rooms: slice, t };
  }

  bestMulti.rooms.forEach((r) => (r.occupied = true));
  return bestMulti.rooms;
}

// UI Actions
document.getElementById("bookBtn").onclick = () => {
  const need = Number(document.getElementById("count").value);
  const got = book(need);
  if (!got.length) {
    draw();
    return;
  }
  statusEl.textContent = `Booked: ${got
    .map((r) => r.number)
    .join(", ")} (travel ≈ ${travelTime(got)} min)`;
  draw();
};

document.getElementById("randBtn").onclick = () => {
  rooms.forEach((r) => (r.occupied = Math.random() < 0.35));
  statusEl.textContent = "Randomised occupancy.";
  draw();
};

document.getElementById("resetBtn").onclick = () => {
  rooms.forEach((r) => (r.occupied = false));
  statusEl.textContent = "";
  draw();
};
