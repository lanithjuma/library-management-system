import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<string, { title: string; author: string; publishedYear: number }[]> = {
  'Science Fiction': [
    { title: 'Dune', author: 'Frank Herbert', publishedYear: 1965 },
    { title: 'Neuromancer', author: 'William Gibson', publishedYear: 1984 },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', publishedYear: 1969 },
    { title: 'Foundation', author: 'Isaac Asimov', publishedYear: 1951 },
  ],
  Fantasy: [
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', publishedYear: 1937 },
    { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', publishedYear: 1968 },
    { title: 'The Name of the Wind', author: 'Patrick Rothfuss', publishedYear: 2007 },
    { title: 'American Gods', author: 'Neil Gaiman', publishedYear: 2001 },
  ],
  Mystery: [
    { title: 'And Then There Were None', author: 'Agatha Christie', publishedYear: 1939 },
    { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', publishedYear: 1902 },
    { title: 'Gone Girl', author: 'Gillian Flynn', publishedYear: 2012 },
    { title: 'The Big Sleep', author: 'Raymond Chandler', publishedYear: 1939 },
  ],
  'African Literature': [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', publishedYear: 1958 },
    { title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong’o', publishedYear: 1964 },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', publishedYear: 2006 },
    { title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', publishedYear: 1977 },
  ],
};

async function main() {
  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    await prisma.book.createMany({
      data: books.map((b) => ({ ...b, genreId: genre.id })),
      skipDuplicates: true, // safe to re-run
    });
  }

  const genres = await prisma.genre.count();
  const books = await prisma.book.count();
  console.log(`Seeded ${genres} genres and ${books} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
