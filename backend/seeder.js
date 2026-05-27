const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Story = require('./models/Story');
const Comment = require('./models/Comment');

// Load environment variables
dotenv.config();

const users = [
  {
    name: "Platform Admin",
    email: "admin@whisperingquills.com",
    password: "admin123",
    avatar: "https://ui-avatars.com/api/?name=Platform+Admin&background=3b1714&color=f7eadc&size=150",
    bio: "Platform Administrator. Keeper of vintage story sharing magic.",
    role: "admin"
  },
  {
    name: "Story Writer",
    email: "user@whisperingquills.com",
    password: "user123",
    avatar: "https://ui-avatars.com/api/?name=Story+Writer&background=c77966&color=fff&size=150",
    bio: "A passionate storyteller exploring forgotten magical tales.",
    role: "user"
  },
  {
    name: "Eleanor Whitmore",
    email: "eleanor@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Eleanor+Whitmore&background=ead5c9&color=3b1714&size=150",
    bio: "Weaving tales of vintage magic and forgotten folklore by candlelight.",
    role: "user"
  },
  {
    name: "Sebastian Crane",
    email: "sebastian@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Sebastian+Crane&background=7a4a3a&color=fff&size=150",
    bio: "Mystery writer and amateur historian. Every quill holds a hidden truth.",
    role: "user"
  },
  {
    name: "Arabella Moon",
    email: "arabella@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Arabella+Moon&background=d99b8a&color=fff&size=150",
    bio: "Fantasy author and dreamer. I paint beautiful worlds with words and starlight.",
    role: "user"
  },
  {
    name: "Percival Vance",
    email: "percival@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Percival+Vance&background=8E7C68&color=fff&size=150",
    bio: "Historical fiction writer fascinated by the secrets of past centuries.",
    role: "user"
  },
  {
    name: "Beatrice Sterling",
    email: "beatrice@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Beatrice+Sterling&background=b56855&color=fff&size=150",
    bio: "Poet and dark romantic. Capturing the transient beauty of autumn leaves.",
    role: "user"
  },
  {
    name: "Julian Thorne",
    email: "julian@whisperingquills.com",
    password: "userpassword123",
    avatar: "https://ui-avatars.com/api/?name=Julian+Thorne&background=4d1f1b&color=fff&size=150",
    bio: "Gothic horror specialist. Exploring the architecture of nightmares.",
    role: "user"
  }
];

// Stories authored by the demo "writer" user
const writerStories = [
  {
    title: "The Ink That Bleeds Stars",
    category: "Fantasy",
    summary: "A scribe discovers that every word she writes in the ancient grimoire bleeds into the night sky as a constellation, making her stories visible to the gods.",
    content: `<p>Isadora had been a copyist for the monastery her entire adult life. She did not question the old grimoire when it arrived — wrapped in black oilskin, bound with a ribbon of dried moonflower — until the night she copied her first line and watched the ink rise from the parchment, spiral through the window, and bloom across the sky as a new star.</p>
<p>By morning the astronomers were frantic. The charts were wrong. Entire constellations had shifted. What no one knew was that the stars were merely letters — a sentence Isadora had been writing for twenty years without realizing it.</p>
<p>When she finally understood, she picked up her quill with trembling hands and wrote the last word. The sky rearranged itself into a single sentence, visible to every city on the continent: <em>We have always been watching you, little scribe.</em></p>`,
    coverImage: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80",
    readTime: "13 min",
    tags: ["fantasy", "stars", "writing", "magic"],
    featured: true
  },
  {
    title: "The Cartographer of Forgotten Doors",
    category: "Adventure",
    summary: "A wandering mapmaker charts invisible doors scattered across the countryside — doors that open onto places that no longer exist, or have not yet come to be.",
    content: `<p>Milo Ashford sold maps no one else could make. Not because he was especially gifted — he had terrible handwriting and his rivers occasionally ran uphill — but because he was the only one who could see the doors.</p>
<p>They appeared at the edges of things: behind old mill wheels, beneath the roots of oak trees, inside the hollow of a broken chimney stack. Each one led somewhere impossible. The door behind the miller's wheel opened onto a sunlit harbor from three hundred years ago. The oak-root door spilled into a city that smelled of rain and metal, with carriages that moved by themselves.</p>
<p>Milo documented them all in his leather-bound atlas with careful, affectionate notes. <em>Door number forty-seven: leads to a kitchen where someone is always baking bread. Highly recommended on cold evenings.</em></p>`,
    coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    readTime: "17 min",
    tags: ["adventure", "maps", "doors", "exploration"],
    featured: false
  }
];

const sampleStories = [
  {
    title: "The Clockmaker's Daughter",
    category: "Fairy Tale",
    summary: "When the royal clockmaker vanishes, his daughter must wind the great celestial timepiece — or the world will lose its sense of tomorrow.",
    content: `<p>Once, in a valley carved from sapphire mountains, there lived a clockmaker who kept the pulse of the world. His name was Ptolemy Voss, and his creations did not simply measure time; they nurtured it.</p>
<p>Every gear, cog, and pendulum in his workshop hummed with a delicate magic. But his greatest work was his daughter, Clara. Clara grew up amidst the rhythmic ticking of timepieces, learning the language of brass and gears before she could write her name.</p>
<p>On the eve of the winter solstice, Ptolemy disappeared without a trace. In his place sat an unfinished pocket watch made of amber and moonstone, ticking at a desperate, frantic pace. Clara knew that if the great celestial clock atop the ivory spire was not wound by midnight, tomorrow would never rise.</p>`,
    coverImage: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80",
    readTime: "15 min",
    tags: ["fairy tale", "time", "clocks", "magic"],
    featured: true
  },
  {
    title: "Salt and Sorrow",
    category: "Mystery",
    summary: "A fisherman's widow discovers that the ocean calls to her — and it holds a confession about her husband's disappearance twenty years ago.",
    content: `<p>The sea does not forget, nor does it keep its secrets easily. For twenty years, Maura stood on the jagged cliffs of Blackwood Cove, watching the grey waves rise and shatter against the rocks.</p>
<p>Her husband, Donnell, had sailed out into a quiet dawn and never returned. The village elders spoke of a sudden storm, but Maura knew the weather had been as calm as glass. It was only when a glass bottle washed ashore, sealed with an alchemical wax she recognized, that the truth began to emerge from the salt.</p>`,
    coverImage: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80",
    readTime: "14 min",
    tags: ["mystery", "sea", "grief", "secrets"],
    featured: false
  },
  {
    title: "The Girl Who Collected Shadows",
    category: "Fantasy",
    summary: "In a world where shadows have personalities of their own, Clara discovers that her shadow is plotting to escape into the dark.",
    content: `<p>Clara was the only shadow-catcher in the borough. While others ignored their silhouettes, Clara conversed with them. Shadows, she discovered, were reservoirs of silent thoughts, longings, and forgotten dreams.</p>
<p>One evening, as the candlelight flickered against her parchment wallpaper, Clara noticed her shadow was refusing to mirror her movements. Instead, it stood independent, pointing toward the window and tracing the outline of a distant obsidian forest.</p>`,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    readTime: "16 min",
    tags: ["fantasy", "shadows", "magic", "adventure"],
    featured: true
  },
  {
    title: "Letters Never Sent",
    category: "Romance",
    summary: "A young archivist discovers a hidden chest of love letters from the 1800s, and finds herself writing replies that transcend time itself.",
    content: `<p>Dr. Constance Fairweather liked quiet places, which was why she spent her days in the basement vaults of the Royal Archives. Among the crumbling ledgers and moldy deeds, she found a small rosewood box bound in tarnished brass.</p>
<p>Inside lay a bundle of letters, tied with faded silk ribbon. They were addressed to a 'Miss E.' and written in a passionate, desperate hand. As Constance read the words of Alistair Vance, a poet who had died in 1845, she felt a profound connection. That night, she took a quill, dipped it in sepia ink, and began to write back.</p>`,
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    readTime: "18 min",
    tags: ["letters", "history", "love", "mystery"],
    featured: true
  },
  {
    title: "A Recipe for Forgetting",
    category: "Romance",
    summary: "A chef recreates her grandmother's ancient desserts to help local villagers let go of their deepest sorrows.",
    content: `<p>In the bakery at the corner of Hearthside Lane, the air was always sweet with cinnamon and rosemary. Miriam Solano did not make ordinary bread. She practiced a kitchen alchemy passed down through six generations of women.</p>
<p>For those suffering from broken hearts, she baked lavender-infused tarts. For those carrying ancient grudges, a slice of cardamom spice cake. But the hardest recipe was the one she needed herself: a recipe to forget the traveler who had promised to return when the cherry blossoms bloomed.</p>`,
    coverImage: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80",
    readTime: "20 min",
    tags: ["food", "memory", "grief", "healing"],
    featured: false
  },
  {
    title: "The Whispering Quill",
    category: "Poetry",
    summary: "An alchemist's pen writes down the silent longings of a forgotten city, drawing two lonely souls together.",
    content: `<p>The quill sat in a glass dome in the museum of curiosities. It was plucked from a bird that existed only in dreams, its feathers shimmering like petroleum on water. When Julian took it home, he discovered it didn't write ink — it wrote truth.</p>`,
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80",
    readTime: "8 min",
    tags: ["poetry", "ink", "whispering", "cities"],
    featured: true
  },
  {
    title: "The Star-Bound Galleon",
    category: "Adventure",
    summary: "A sky-captain charts a path through the stellar nebula to find a legendary island made of fallen constellations.",
    content: `<p>The deck of the Aethelgard smelled of pine and ozone. Unlike the ships that docked in the harbors of the lower seas, the Aethelgard sailed the midnight skies, riding the thermal winds of the upper atmosphere.</p>`,
    coverImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80",
    readTime: "22 min",
    tags: ["sky", "adventure", "stars", "ship"],
    featured: false
  },
  {
    title: "Shadows of the Alchemist",
    category: "Mystery",
    summary: "A young apprentice discovers that her master's gold is made not from lead, but from the condensed memories of sleeping children.",
    content: `<p>The furnaces of Master Nicholas burned with a strange, green flame. For years, Clara believed her master was simply a master of metallurgy. But when she found the secret cellar beneath the smelting floor, she found rows of glass jars humming with dreams.</p>`,
    coverImage: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=600&q=80",
    readTime: "16 min",
    tags: ["mystery", "alchemy", "master", "dark"],
    featured: false
  },
  {
    title: "The Lost Symphony",
    category: "Poetry",
    summary: "A blind violinist plays a song that causes winter flowers to bloom out of season, awakening a dormant legend.",
    content: `<p>The notes rose like smoke in the chilly conservatory. Julian closed his eyes, drawing the bow across the strings. He could not see the frost on the glass, but he felt the sudden warmth as a pale rose blossomed from the frozen soil.</p>`,
    coverImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
    readTime: "12 min",
    tags: ["music", "violin", "winter", "flowers"],
    featured: false
  },
  {
    title: "The Midnight Market",
    category: "Fantasy",
    summary: "An open-air bazaar appears only when the moon is perfectly eclipsed, selling items that cannot exist in daylight.",
    content: `<p>You could not find the Midnight Market with a map. It appeared where three roads crossed beneath a blackened moon. Tents of purple velvet smelled of roasted chestnuts, dried lotus, and stardust.</p>`,
    coverImage: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=600&q=80",
    readTime: "14 min",
    tags: ["market", "midnight", "moon", "magic"],
    featured: false
  },
  {
    title: "The Weaver's Tapestry",
    category: "Fairy Tale",
    summary: "A mute weaver spins threads of gold and silver that depict the future of the kingdom — until she weaves her own execution.",
    content: `<p>Elena's loom sang a rhythmic song of clatter and release. Her tapestries were famous across the duchy, for they predicted the autumn harvest, the birth of princes, and the arrival of wars. But her latest weave was a darker thing.</p>`,
    coverImage: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&q=80",
    readTime: "15 min",
    tags: ["weaver", "future", "gold", "tapestry"],
    featured: false
  },
  {
    title: "Echoes of the Conservatory",
    category: "Historical",
    summary: "A young musician in 19th-century Vienna discovers a piano that plays the thoughts of the person who touched it last.",
    content: `<p>The grand piano stood in the corner of the music hall, its mahogany wood polished to a high mirror shine. When Stefan pressed a middle C, a whisper filled his mind — the secret confession of the conservatory's premiere soprano.</p>`,
    coverImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80",
    readTime: "17 min",
    tags: ["music", "piano", "vienna", "history"],
    featured: false
  },
  {
    title: "The Mapmaker's Dream",
    category: "Sci-Fi",
    summary: "A cartographer designs a map of a city that does not exist, only to wake up walking its unfamiliar streets.",
    content: `<p>The ink was still wet on the parchment. Arthur had drawn every bridge, canal, and cobblestone alleyway of 'Oakhaven' out of pure imagination. But when he opened his front door, the familiar scent of soot was gone — replaced by sea air.</p>`,
    coverImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80",
    readTime: "19 min",
    tags: ["map", "city", "dream", "cartography"],
    featured: false
  },
  {
    title: "The Glass Greenhouse",
    category: "Children",
    summary: "Two siblings discover a magical glasshouse where plants grow under keyholes, responding only to stories whispered to them.",
    content: `<p>Grandfather's greenhouse sat at the end of the orchard, its glass panes green with moss. Inside, the plants were locked in small iron cages. 'They only open for a good tale,' Grandfather had whispered, handing them the key.</p>`,
    coverImage: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80",
    readTime: "11 min",
    tags: ["children", "greenhouse", "plants", "whisper"],
    featured: false
  },
  {
    title: "The Lighthouse Keeper's Secret",
    category: "Historical",
    summary: "An old keeper guards a light that guides not ships, but travelers who have wandered out of their own time periods.",
    content: `<p>The light at Blackwood Point did not blink. It burned with a warm, steady crimson glow. Old Thomas climbed the spiral steps every evening, checking the oil. He knew that tonight, a visitor from the year 1742 would emerge from the fog.</p>`,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    readTime: "21 min",
    tags: ["historical", "lighthouse", "time", "sea"],
    featured: false
  }
];

const seedData = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://pawarparth915_db_user:DzE1SE4RQx9zSp0K@whispering.wjhzmxr.mongodb.net/whispering?retryWrites=true&w=majority&appName=whispering');
    console.log('[Seeder]: Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany();
    await Story.deleteMany();
    await Comment.deleteMany();
    console.log('[Seeder]: Cleared existing collections.');

    // Seed Users
    const createdUsers = await User.create(users);
    console.log('[Seeder]: Successfully created users.');

    const admin = createdUsers[0];
    const writer = createdUsers[1];
    const eleanor = createdUsers[2];
    const sebastian = createdUsers[3];
    const arabella = createdUsers[4];
    const percival = createdUsers[5];
    const beatrice = createdUsers[6];
    const julian = createdUsers[7];

    // Seed mutual followers & following (including demo writer)
    writer.followers = [eleanor._id, sebastian._id, arabella._id];
    writer.following = [eleanor._id, arabella._id];

    eleanor.followers = [sebastian._id, arabella._id, percival._id, beatrice._id, writer._id];
    eleanor.following = [sebastian._id, arabella._id, writer._id];

    sebastian.followers = [eleanor._id, arabella._id, julian._id, writer._id];
    sebastian.following = [eleanor._id, percival._id];

    arabella.followers = [eleanor._id, beatrice._id, writer._id];
    arabella.following = [eleanor._id, sebastian._id, julian._id];

    percival.followers = [sebastian._id];
    percival.following = [eleanor._id, beatrice._id];

    beatrice.followers = [percival._id, julian._id];
    beatrice.following = [eleanor._id, arabella._id];

    julian.followers = [arabella._id];
    julian.following = [sebastian._id, beatrice._id];

    await Promise.all([
      writer.save(),
      eleanor.save(),
      sebastian.save(),
      arabella.save(),
      percival.save(),
      beatrice.save(),
      julian.save()
    ]);
    console.log('[Seeder]: Successfully seeded user following/follower arrays.');

    // Seed writer's own 2 stories with likes
    const writerStoriesWithAuthor = writerStories.map((story, index) => ({
      ...story,
      author: writer._id,
      likes: [eleanor._id, sebastian._id, arabella._id, percival._id].slice(0, index + 3)
    }));
    const createdWriterStories = await Story.create(writerStoriesWithAuthor);

    // Prepare Stories with authors and likes
    const storiesWithAuthors = sampleStories.map((story, index) => {
      let authorId = eleanor._id;
      if (index % 5 === 1) authorId = sebastian._id;
      else if (index % 5 === 2) authorId = arabella._id;
      else if (index % 5 === 3) authorId = percival._id;
      else if (index % 5 === 4) authorId = beatrice._id;
      else if (index === 5) authorId = julian._id;

      // Real user likes
      const likes = [eleanor._id, sebastian._id, arabella._id, percival._id, beatrice._id, julian._id].slice(0, (index % 5) + 2);

      return {
        ...story,
        author: authorId,
        likes
      };
    });

    const createdStories = await Story.create(storiesWithAuthors);
    const allCreatedStories = [...createdWriterStories, ...createdStories];
    console.log('[Seeder]: Successfully seeded stories.');

    // Seed 30 highly realistic comments
    const commentTexts = [
      "The language in this piece is absolutely gorgeous. It reads like a classic fable.",
      "A stunning concept! I loved the description of the amber pocket watch.",
      "The sea atmosphere was incredibly thick here. I could almost smell the salt.",
      "This mystery left me wanting so much more! What was in the bottle?",
      "The interplay of shadows and emotions was so beautifully executed.",
      "This is one of the best fantasy quills I've read this season. Tremendous job.",
      "The connection between Constance and Alistair gave me actual goosebumps.",
      "I love how letters can bridge centuries. Writing replies is a brilliant touch.",
      "A cozy, warm, and thoroughly magical culinary tale. It warmed my heart.",
      "Miriam's recipes sound delicious and melancholic. I need to make some cardamom cake now.",
      "Every single line feels like a stanza in an epic poem. Gorgeous writing.",
      "An incredibly imaginative sky adventure. The atmospheric wind descriptions were spot on.",
      "Nicholas is a dark, fascinating character. I hope there is a sequel!",
      "The music conservatory setting was highly detailed. Excellent historical flavor.",
      "This dream-mapping concept blew my mind. Beautifully written.",
      "I read this to my children and they were completely spellbound by the lockboxes.",
      "Thomas is the perfect lighthouse keeper. A very satisfying vintage mystery.",
      "I loved Clara's mechanical genius. She is a great role model.",
      "The ending of this story left me in absolute tears. Splendid romantic prose.",
      "Simple, crisp, and incredibly nostalgic. It reminds me of Grimm's tales.",
      "Truly brilliant pacing. I read the entire story without pausing once.",
      "The alchemical green fire was such a memorable visual detail.",
      " Vienna in the 1800s was captured perfectly. The soprano's confession was a great twist.",
      "I loved how Oakhaven actually became real. What a classic fantasy trope done well.",
      "A wonderfully gentle story. The orchids locked in keyholes is a beautiful image.",
      "Blackwood Cove sounds like a place I would love to visit, despite the tragedy.",
      "A remarkable literary exercise. This platforms needs more writers of your caliber.",
      "The description of Clara's silhouette dancing independently was so spooky and lovely.",
      "Constance is a wonderful protagonist. I loved her solitary archivist life.",
      "Another masterpiece! I will definitely bookmark this on my shelf."
    ];

    // 4 comments specifically on writer's stories
    const writerStoryComments = [
      { user: eleanor._id, story: createdWriterStories[0]._id, text: "Isadora's story gave me chills. The idea of writing stars into the sky is hauntingly beautiful.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { user: sebastian._id, story: createdWriterStories[0]._id, text: "Absolutely mesmerizing. The final line is one of the best endings I have read this year.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { user: arabella._id, story: createdWriterStories[1]._id, text: "Door number forty-seven made me laugh and then immediately feel melancholy. Brilliant.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { user: percival._id, story: createdWriterStories[1]._id, text: "Milo is exactly the kind of wandering, gentle hero I love reading about. More please!", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ];

    const comments = [];
    for (let i = 0; i < 30; i++) {
      const userIndex = i % createdUsers.length;
      const storyIndex = i % createdStories.length;
      
      comments.push({
        user: createdUsers[userIndex]._id,
        story: createdStories[storyIndex]._id,
        text: commentTexts[i],
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // scattered dates
      });
    }

    const allCommentDocs = await Comment.create([...writerStoryComments, ...comments]);
    const createdComments = allCommentDocs.slice(writerStoryComments.length);
    console.log('[Seeder]: Successfully seeded 34 comments (4 on writer stories + 30 on others).');

    // Push comment IDs into their story's comments array
    const writerCommentDocs = allCommentDocs.slice(0, writerStoryComments.length);
    for (const commentDoc of writerCommentDocs) {
      await Story.findByIdAndUpdate(commentDoc.story, { $push: { comments: commentDoc._id } });
    }
    for (const commentDoc of createdComments) {
      await Story.findByIdAndUpdate(commentDoc.story, { $push: { comments: commentDoc._id } });
    }
    console.log('[Seeder]: Pushed comment IDs into story comment arrays.');

    console.log('\x1b[32m%s\x1b[0m', '=== [Database Seeding Completed Successfully] ===');
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
