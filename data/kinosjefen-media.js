/* Plassholdere for bilder, video og lyd.
   La src stå tom, så vises teksten som står i HTML.
   Bytt ut senere ved å fylle src (og alt). type er "image" eller "video".
   Lyd: fyll audio[nokkel].src med en fil, så spilles den av knappen med samme data-audio.
   Utklipp: fyll clips[nokkel].src for å vise et skann i lightboxen. */
const KINOSJEFEN_MEDIA = {
  hero: { type: "image", src: "../images/kjeldsen-slutter.jpg", alt: "Olav Kjeldsen sitter i kinosalen. Hentet fra Fredriksstad Blad." },
  grotte: { type: "image", src: "../images/olav-kjeldsen-1995.jpg", alt: "Olav Kjeldsen foran Blå Grotte i Fredrikstad, med skiltet og filmplakater bak seg." },
  havana: { type: "image", src: "../images/kinoutstyr-cuba.jpg", alt: "Kinosjef Olav Kjeldsen (f.v) og kultursjef i Fredrikstad Egil Syversen sammen med president i det cubanske filminstituttet, Omar Gonzalez, på Cuba. Foto: Trond Thorvaldsen, 06.07.2003. Hentet fra Fredrikstad blad." },
  audio: {
    kredo: { src: "../audio/tilgivelse-enn-tillatelse.m4a" },
    cowboy: { src: "../audio/historie_cowboyer_i_kinosalen.m4a" },
    bond: { src: "../audio/historie_james_bond.m4a" },
    flintstones: { src: "../audio/historie_flintstones_bilen.m4a" },
    utvalgte: { src: "../audio/historie_kinosjefens_utvalgte_italiensk_film.m4a" }
  },
  clips: {
    teip: {
      src: "../images/kjeldsen-teip-munn.jpg",
      alt: "Avisutklipp med overskriften «Munnkurv for Kjeldsen», der Olav Kjeldsen har teip over munnen. Bilde tatt fra bladet Hele byens kino, lagd av Geir Løvli og Jørgen Søderberg Jansen. Dato 05.11.83."
    },
    che: {
      src: "../images/olav-che-tskjorte.jpg",
      alt: "Olav Kjeldsen sitter på en benk ved sjøen i en hvit t-skjorte med portrett av Che Guevara."
    }
  }
};
