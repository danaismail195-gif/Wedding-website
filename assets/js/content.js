/* ==========================================================================
   content.js  —  ✏️  THIS IS THE FILE YOU EDIT
   --------------------------------------------------------------------------
   Every word on the website lives here. Nothing else needs to be touched to
   change dates, venues, hotel links or RSVP questions.

   Rules of thumb:
     • Keep the quote marks " " around text. Change what's between them.
     • Keep the commas at the end of each line.
     • To remove a card or a fact, delete the whole { ... } block including
       its trailing comma.

   Everything below is PLACEHOLDER content for Montenegro (Bay of Kotor).
   ========================================================================== */
(function (global) {
  'use strict';

  var CONTENT = {

    /* ---- The couple -------------------------------------------------- */
    couple: {
      names: 'Dana & Nadeem',           // shown on the loading screen + header
      dateLine: '11 – 13 June 2027',
      place: 'Bay of Kotor, Montenegro',
      hashtag: '#DanaAndNadeemGoAdriatic',
      // The little note on the loading screen
      invitation: 'We are getting married on the Adriatic, and we would very much like you there.',
      // Where guests should write with questions. Used in several places.
      email: 'hello@danaandnadeem.example'
    },

    /* ---- Where to send RSVP submissions ------------------------------ *
     * Leave as '' and the form saves to the guest's browser and shows a
     * confirmation (fine for testing). To collect real answers, make a free
     * form at https://formspree.io and paste its URL here, e.g.
     *   rsvpEndpoint: 'https://formspree.io/f/xxxxxxx',
     * ------------------------------------------------------------------ */
    rsvpEndpoint: '',

    /* ---- The seven entrances, in the order guests walk past them ----- */
    rooms: [

      /* ============================== 1 ============================== */
      {
        id: 'welcome',
        num: 'I',
        label: 'Welcome Dinner',
        sublabel: 'Thursday evening',
        kicker: 'The first evening',
        title: 'Welcome Dinner',
        intro: 'Long tables, too much bread, and the first hellos. Come as you are — this is the easy one.',
        blocks: [
          { type: 'facts', items: [
            { label: 'When',      value: 'Thursday 11 June 2027' },
            { label: 'Time',      value: '7:30pm — arrive any time from 7:00pm' },
            { label: 'Where',     value: 'Konoba Stari Mlin, Perast' },
            { label: 'About',     value: 'A stone courtyard on the water, five minutes on foot from the Perast waterfront.' },
            { label: 'Dress',     value: 'Relaxed linen. Flat shoes — the lanes are cobbled.' }
          ]},
          { type: 'note', title: 'A note from us',
            text: 'Most of you will have travelled a long way to be there, so we have kept the first night deliberately unstructured. There are no speeches, no seating plan and no schedule. Turn up, find a glass, and let us introduce you to the people you will be spending the weekend with.' },
          { type: 'links', items: [
            { text: 'Open in Google Maps', href: 'https://maps.google.com/?q=Perast+Montenegro' }
          ]}
        ]
      },

      /* ============================== 2 ============================== */
      {
        id: 'wedding',
        num: 'II',
        label: 'The Wedding',
        sublabel: 'Friday, golden hour',
        kicker: 'The main event',
        title: 'The Wedding',
        intro: 'A ceremony on the cliff terrace as the light goes gold, then dinner under the olive trees.',
        blocks: [
          { type: 'facts', items: [
            { label: 'When',         value: 'Friday 12 June 2027' },
            { label: 'Arrive by',    value: '4:30pm' },
            { label: 'Ceremony',     value: '5:00pm sharp — we mean it kindly, but sharp' },
            { label: 'Where',        value: 'Villa Miloš, above Stoliv' },
            { label: 'About',        value: 'A restored stone villa with terraced gardens dropping toward the bay.' },
            { label: 'Dress',        value: 'Formal garden party. Block heels or flats strongly advised — the terraces are gravel and stone.' },
            { label: 'Carries on',   value: 'Dinner at 7:00pm, dancing from 9:30pm' }
          ]},
          { type: 'note', title: 'The shape of the day',
            text: 'Ceremony on the upper terrace, drinks and photographs in the olive grove while the sun drops behind the mountain, then dinner on the long terrace facing the water. Buses run from the Kotor and Perast hotels from 3:45pm and back again at midnight and 1:30am — details in Travel Details.' },
          { type: 'links', items: [
            { text: 'Open in Google Maps', href: 'https://maps.google.com/?q=Stoliv+Montenegro' }
          ]}
        ]
      },

      /* ============================== 3 ============================== */
      {
        id: 'afterparty',
        num: 'III',
        label: 'The After-Party',
        sublabel: 'Friday, very late',
        kicker: 'When the lights go down',
        title: 'The After-Party',
        intro: 'Same night, different mood. Down the hill, into the vaults, until someone turns the lights on.',
        blocks: [
          { type: 'facts', items: [
            { label: 'When',   value: 'Friday 12 June 2027, from 11:30pm' },
            { label: 'Where',  value: 'The Vaults, Old Town Kotor' },
            { label: 'Until',  value: 'Officially 3:00am. Unofficially, whenever' },
            { label: 'Dress',  value: 'Whatever you wore to dinner, minus the jacket' },
            { label: 'Theme',  value: 'Adriatic disco — live DJ, a lot of 90s' }
          ]},
          { type: 'note', title: 'Small print',
            text: 'Shoes optional once you are downstairs. There is a late bar, a lot of water, and something greasy served at 1am. The last bus back to Perast leaves at 1:30am; after that it is taxis, and we will have numbers pinned by the door.' }
        ]
      },

      /* ============================== 4 ============================== */
      {
        id: 'explore',
        num: 'IV',
        label: 'Explore',
        sublabel: 'The whole bay',
        kicker: 'While you are here',
        title: 'Explore',
        intro: 'Make a week of it. Here is everything we would drag you to ourselves, sorted by mood.',
        blocks: [
          { type: 'cards', filterable: true, items: [
            { group: 'sights', name: 'Our Lady of the Rocks',
              text: 'A man-made island with a blue-domed church, built up over centuries by sailors dropping stones. Boats go from Perast waterfront, ten minutes, a few euros.',
              meta: 'Perast · 15 min from Kotor',
              href: 'https://maps.google.com/?q=Our+Lady+of+the+Rocks+Perast' },
            { group: 'adventure', name: 'Kotor city walls',
              text: '1,350 steps up the fortifications to San Giovanni fortress. Brutal in the heat, unbeatable at the top. Go at 7am or at 6pm, never at noon.',
              meta: 'Kotor · 2 hrs return',
              href: 'https://maps.google.com/?q=Kotor+City+Walls' },
            { group: 'culture', name: 'Kotor Old Town',
              text: 'A walled maze of squares, cats and Venetian stonework. Get properly lost for an afternoon, then have coffee in Trg od Oružja.',
              meta: 'Kotor · half a day',
              href: 'https://maps.google.com/?q=Kotor+Old+Town' },
            { group: 'relaxation', name: 'Ludviks Beach, Ljuta',
              text: 'A quiet swimming platform on the bay side with a decent restaurant attached. Cold, clear, deep water straight off the ladder.',
              meta: 'Ljuta · 20 min from Kotor',
              href: 'https://maps.google.com/?q=Ljuta+Montenegro' },
            { group: 'adventure', name: 'Boat day on the bay',
              text: 'Hire a small boat with a skipper for a half day — the Blue Cave, Mamula island, and a swim stop where nobody else is. Book a week ahead in June.',
              meta: 'From Kotor or Perast · 4 hrs' },
            { group: 'sights', name: 'Kotor Serpentine (Ladder of Cattaro)',
              text: 'Twenty-five hairpins up the mountain behind Kotor. Drive it at sunset and stop at the third-to-last bend for the photograph everyone takes.',
              meta: 'Kotor · 1 hr by car',
              href: 'https://maps.google.com/?q=Kotor+Serpentine+Road' },
            { group: 'culture', name: 'Perast, slowly',
              text: 'Sixteen palaces, one street, no cars. Walk the length of it, climb the bell tower of St Nicholas, and eat on the water at the far end.',
              meta: 'Perast · 3 hrs',
              href: 'https://maps.google.com/?q=Perast' },
            { group: 'relaxation', name: 'Njeguši village lunch',
              text: 'Up in the mountains, on the way to Lovćen. Smoked ham, sheep cheese, cold rakija, twelve degrees cooler than the coast.',
              meta: 'Njeguši · 45 min drive',
              href: 'https://maps.google.com/?q=Njegusi+Montenegro' },
            { group: 'adventure', name: 'Lovćen National Park',
              text: 'The mausoleum at the top of the mountain, 461 steps through a tunnel, and a view across half the country to Albania on a clear day.',
              meta: 'Lovćen · full day',
              href: 'https://maps.google.com/?q=Lovcen+National+Park' },
            { group: 'sights', name: 'Sveti Stefan, from above',
              text: 'The famous fortified islet on the Budva side. You cannot walk on unless you are staying, but the view from the road above is the point.',
              meta: 'Budva riviera · 50 min drive',
              href: 'https://maps.google.com/?q=Sveti+Stefan' }
          ]}
        ]
      },

      /* ============================== 5 ============================== */
      {
        id: 'stay',
        num: 'V',
        label: 'Where to Stay',
        sublabel: 'Beds on the bay',
        kicker: 'Somewhere to sleep',
        title: 'Where to Stay',
        intro: 'We have held rooms at the first three until 1 March 2027. Mention "Dana &amp; Nadeem" when booking.',
        blocks: [
          { type: 'cards', filterable: false, items: [
            { group: 'stay', name: 'Hotel Conte, Perast',
              text: 'Stone apartments scattered along the Perast waterfront. Where we are staying, and where the welcome dinner is.',
              meta: '€€ · 20 min to venue · rooms held',
              href: 'https://maps.google.com/?q=Hotel+Conte+Perast' },
            { group: 'stay', name: 'Hotel Vardar, Kotor',
              text: 'Inside the old town walls, right on the main square. Best choice if you want to walk home from the after-party.',
              meta: '€€ · 25 min to venue · rooms held',
              href: 'https://maps.google.com/?q=Hotel+Vardar+Kotor' },
            { group: 'stay', name: 'Apartments Muo',
              text: 'Simple, spotless apartments across the water from Kotor, most with a small terrace. Good value, good for families.',
              meta: '€ · 15 min to venue · rooms held',
              href: 'https://maps.google.com/?q=Muo+Montenegro' },
            { group: 'stay', name: 'Boutique Hotel Hippocampus, Kotor',
              text: 'A restored palace in the old town. Quieter and more polished than Vardar, a little more expensive.',
              meta: '€€€ · 25 min to venue',
              href: 'https://maps.google.com/?q=Hippocampus+Kotor' },
            { group: 'stay', name: 'Villa rentals, Stoliv & Prčanj',
              text: 'If you are coming as a group, the villas along the Stoliv road are the closest thing to the venue. Look on Airbnb or Booking for "Stoliv" and "Prčanj".',
              meta: '€€ – €€€€ · 5 – 15 min to venue' }
          ]},
          { type: 'note', title: 'Booking advice',
            text: 'June is high season on the bay and the good places go by February. If you are planning to come, book something refundable now and worry about the details later. If cost is a factor, tell us — we would far rather help than have you not come.' }
        ]
      },

      /* ============================== 6 ============================== */
      {
        id: 'travel',
        num: 'VI',
        label: 'Travel Details',
        sublabel: 'Getting there',
        kicker: 'The logistics',
        title: 'Travel Details',
        intro: 'Two airports, one road along the water, and a bus that will collect you from your hotel.',
        blocks: [
          { type: 'facts', items: [
            { label: 'Nearest airport', value: 'Tivat (TIV) — 25 minutes by car to Kotor. Small, seasonal, ideal.' },
            { label: 'Alternative',     value: 'Podgorica (TGD) — 1 hr 30. Dubrovnik (DBV), Croatia — 2 hrs including a land border.' },
            { label: 'Arrive',          value: 'Wednesday 10 June or Thursday 11 June morning' },
            { label: 'Leave',           value: 'Sunday 14 June — Saturday is for swimming and recovering' },
            { label: 'Visas',           value: 'UK, EU, US, CA, AU and NZ passports: no visa, 90 days. Passport valid 3 months beyond your stay.' },
            { label: 'Currency',        value: 'Euro (€). Cards are widely taken; carry some cash for boats and small konobas.' },
            { label: 'Driving',         value: 'The bay road is single-lane and slow in June. Allow double what the map says.' }
          ]},
          { type: 'cards', filterable: false, items: [
            { group: 'travel', name: 'Wedding-day buses',
              text: 'Free coaches from Hotel Conte (Perast) at 3:45pm and from Kotor North Gate at 4:00pm. Return at 12:00am and 1:30am from the villa, and 1:30am from the after-party.',
              meta: 'Friday 12 June' },
            { group: 'travel', name: 'Airport transfers',
              text: 'Tivat to Kotor is roughly €25–35 by taxi, twenty-five minutes. Book ahead if you land after 10pm, when the rank empties out.',
              meta: 'TIV → Kotor / Perast' },
            { group: 'travel', name: 'Coming via Dubrovnik',
              text: 'More flight choice, but budget an extra hour each way for the border. Do not join the queue on a Saturday afternoon if you can help it.',
              meta: 'DBV → Kotor · 2 – 3 hrs' }
          ]},
          { type: 'note', title: 'Stuck? Ask.',
            text: 'Flights, borders, car hire, anything at all — email us at hello@danaandnadeem.example and we will actually reply. If several of you are landing at the same time we will try to put you in the same car.' }
        ]
      },

      /* ============================== 7 ============================== */
      {
        id: 'rsvp',
        num: 'VII',
        label: 'RSVP',
        sublabel: 'Say yes',
        kicker: 'The important bit',
        title: 'RSVP',
        intro: 'Please reply by 1 March 2027 so we can give the caterers a number they can work with.',
        blocks: [
          { type: 'facts', items: [
            { label: 'Deadline',  value: '1 March 2027' },
            { label: 'Plus ones', value: 'If your invitation named two people, you have one. If you would like to bring someone and it did not, ask us — we will do our best.' },
            { label: 'Children',  value: 'Very welcome at the welcome dinner and the wedding. There is a supervised room with beds from 9pm on the Friday.' },
            { label: 'Questions',  value: 'hello@danaandnadeem.example' }
          ]},
          { type: 'form' }
        ]
      }
    ]
  };

  global.WW = global.WW || {};
  global.WW.CONTENT = CONTENT;
})(window);
