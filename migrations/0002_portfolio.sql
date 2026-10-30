-- Horizon Architecture Studio: projects on the boards, letters to the desk.
create table if not exists projects (
  id                serial primary key,
  slug              text not null unique,
  title             text not null,
  category          text not null,
  location          text not null,
  year              integer not null,
  description       text not null,
  short_description text not null,
  status            text not null check (status in ('Completed', 'Ongoing')),
  image_url         text not null,
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists projects_sort_idx on projects (featured desc, sort_order asc, year desc);

create table if not exists inquiries (
  id         serial primary key,
  name       text not null,
  email      text not null,
  interest   text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

insert into projects (
  slug, title, category, location, year, description, short_description, status, image_url, featured, sort_order
) values
(
  'lumina-tower',
  'Lumina Tower',
  'Residential',
  'Cape Meridian',
  2024,
  $$A slender residence on Cape Meridian’s outer quay. The plan is a lens: living rooms take the evening water, and the service core sits in the cooler north shoulder. A double skin of sea-green glass shades the west face without closing the view. At the ground the tower lifts so the quay path can pass beneath a public colonnade. Completed in 2024 with a timber-lined lobby and precast made along the coast.$$,
  $$A sea-green residential tower lifted over the quay, so the waterfront path never stops.$$,
  'Completed',
  '/plates/lumina.jpg',
  true,
  1
),
(
  'skyline-residences',
  'Skyline Residences',
  'Residential',
  'Highmere Ridge',
  2023,
  $$Twelve houses stepped into Highmere Ridge so each roof becomes the garden of the house above. Stone from the cut itself forms the retaining walls. Glass is used only where the valley opens. Shared stairs replace private driveways, and one cedar canopy marks the common room. Completed in 2023 for a hillside cooperative that wanted density without losing the ridge line.$$,
  $$Terraced houses on a ridge, each roof a garden for the neighbor above.$$,
  'Completed',
  '/plates/skyline.jpg',
  true,
  2
),
(
  'aether-pavilion',
  'Aether Pavilion',
  'Cultural',
  'Glass Orchard Park',
  2025,
  $$A cultural room at the basin of Glass Orchard Park, still in progress. A thin concrete shell folds once, like a sheet of paper, and lands on three points so the path along the water stays open. Daylight enters through a north oculus and a slit that tracks the afternoon. The shell is poured. Interior timber is being fitted for small concerts and school workshops, with an opening planned for late 2026.$$,
  $$A folded concrete shell over the park basin, open underneath for the orchard path.$$,
  'Ongoing',
  '/plates/aether.jpg',
  true,
  3
),
(
  'meridian-atelier',
  'Meridian Atelier',
  'Workplace',
  'Old Foundry District',
  2024,
  $$A workplace carved from a former dye hall. The brick kilns stay as meeting rooms. A pale timber mezzanine slips between them, and courts cut into the deep plan bring work light to every desk. The roof is a garden of grasses that cools the top floor. Completed in 2024 for a design collective of forty people who wanted the old hall to remain legible.$$,
  $$A dye hall reopened as a workplace, with kilns for meeting and a grass roof.$$,
  'Completed',
  '/plates/meridian.jpg',
  false,
  4
),
(
  'solstice-house',
  'Solstice House',
  'Residential',
  'Amber Dunes',
  2022,
  $$A one-storey house in the Amber Dunes, organised around a long reflecting pool. Rammed-earth walls, the colour of the dune at noon, hold the day’s heat and release it after dark. A deep overhang keeps summer sun off the glass. In winter the low sun reaches the stone floor. Completed in 2022 as a quiet retreat used between harvests.$$,
  $$Rammed earth and a still pool in the dunes, shaded by one long overhang.$$,
  'Completed',
  '/plates/solstice.jpg',
  false,
  5
),
(
  'harbor-civic-hall',
  'Harbor Civic Hall',
  'Civic',
  'Northwater Quay',
  2026,
  $$Northwater’s civic hall, still rising on the quay. A copper roof will weather green above a glass colonnade that stays open to the harbour walk. The chamber is a single timber room, sized for council and for winter concerts. The frame is up and the interior is already glowing at dusk. We expect the hall to open in 2027.$$,
  $$A copper-roofed civic chamber on the harbour, open to the quay walk.$$,
  'Ongoing',
  '/plates/harbor.jpg',
  false,
  6
),
(
  'cedar-glass-school',
  'Cedar & Glass School',
  'Education',
  'Fernline Woods',
  2023,
  $$A primary school at the edge of Fernline Woods. Classrooms pair around outdoor work yards, and a cedar walkway keeps the rain off without closing the view of the trees. The hall is the only two-storey volume and marks the entrance from the lane. Completed in 2023, with a kitchen garden planted each spring.$$,
  $$Timber classrooms and a cedar walk at the forest edge, built for a small school.$$,
  'Completed',
  '/plates/cedar.jpg',
  false,
  7
),
(
  'nocturne-museum',
  'Nocturne Museum',
  'Cultural',
  'Lantern Quarter',
  2021,
  $$A small museum of night photography in the Lantern Quarter. The exterior is dark basalt and almost windowless, so the lane stays quiet. Inside, one slot of light drops through three galleries stacked like drawers. Floors are pale ash so the photographs read clearly. Completed in 2021. The museum keeps evening hours only.$$,
  $$A basalt museum that opens after dark, lit by a single slot of gallery light.$$,
  'Completed',
  '/plates/nocturne.jpg',
  false,
  8
)
on conflict (slug) do nothing;
