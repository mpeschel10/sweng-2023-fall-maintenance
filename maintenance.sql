-- mariadb --user=AzureDiamond --password=hunter2 -D sweng < maintenance.sql

DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(8),
    kind SET('TENANT', 'MAINTENANCE', 'MANAGER') NOT NULL,
    CONSTRAINT PRIMARY KEY (id)
);

INSERT INTO users
    (username, password, kind)
VALUES
    ('mpeschel10', 'password', 'MANAGER'),
    ('steveadore', 'password', 'MAINTENANCE'),
    ('rhearst4421', 'password', 'TENANT'),
    ('jbezos303', 'password', 'TENANT'),
    ('dgray01', 'password', 'TENANT')
;

CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255),
    phone CHAR(11),
    email VARCHAR(255),
    in_date BIGINT,
    out_date BIGINT,
    apartment VARCHAR(255),
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO tenants
    (user_id, name, phone, email, in_date, out_date, apartment)
VALUES
    (3, "Randal Hearst", "1234567", "rhearst@psu.edu", 1701882625, NULL, "46a"),
    (4, "Jeff Bezos", "89012345678", "jbezos@psu.edu", 1054440000, 1212984000, "97d"),
    (5, "Dorian Gray", "9012345", "dgray@psu.edu", 3340033438, 555998400, "The shed behind the mortuary")
;

CREATE TABLE requests (
    id INT AUTO_INCREMENT,
    tenant INT,
    apartment VARCHAR(255),
    location VARCHAR(1027),
    description VARCHAR(4095),
    datetime BIGINT,
    photo VARCHAR(2047),
    status SET('PENDING', 'COMPLETED') DEFAULT 'PENDING' NOT NULL,
    CONSTRAINT PRIMARY KEY (id),
    CONSTRAINT FOREIGN KEY (tenant) REFERENCES users (id)
);

-- Some content from https://old.reddit.com/user/Befriendjamin
INSERT INTO requests
    (tenant, apartment, location, description, datetime, photo, status)
VALUES
    (1, '255a', 'Kitchen ceiling', 'Just got to Dublin, Ireland. Technically it’s 6am here. I’m sitting alone at the kitchen table in the airbnb/apartment while K and her sister Y take an hour-long nap in their respective bedrooms. I’ve just put on a lidocaine patch to ease my abdominal pain and that and the hot tea coursing through me are working wonders at stilling the pain, or at least obviating it from central consciousness — this despite me writing about it now (though that itself is another way of distancing myself from the pain).

Loud birds, seagulls, first thing I heard when we stepped out of the taxi on Great George’s Street. And the bracing cold. Pleasant, not biting. It is September, after all. Pink flowers on the windowsill. Large almost floor to ceiling window. Gray sky. Pleasantly old buildings all stacked against each other. Something soft and easy here. I know it isn’t; I know the thing I am thinking of is an illusion, for I am a tourist and naive in many things, but I cannot help but feel that to live here would be to be at some sort of peace.

Building opposite. I can see the roof of an ugly gray building. All concrete. The top floor’s window has some sort of vines growing out of a grate. Plants stacked in the window. The roof above it plants everywhere. Or most places. Can see the leaves waving in the breeze every few seconds. A puff of cloud passing by against the gray sky. Something blue in the sky, almost. A slight blueness to the cloudy background as the white puff progresses, passes, and finally disappears behind a brick building.

Nothing special to the apartment. Those general slightly off-kilter appliances of another country. The toilet slightly different. Every appliance not quite the same. No microwave. God the tea feels good.
', 1699825975, '/uploads/kitchen.png', 'PENDING'),
    (1, '12j', 'Sitting room', 'Like many men who’d undersocialized in their youth, who’d overcome that isolation by seeking out groups in college, he had developed an affectation, a specific adaptation. Every now and then, in little pockets of silence, he’d say something witty or funny, often both. He knew his audience, and he knew who was drunk enough to laugh, and if her laugh was infectious, warm, capable of inspiring further laughter. But this man, these type of men, are by their solitude (or its lifelong aftereffects) incapable of one on one conversation. They lack. I saw it one day, after we’d left a board game party at Frisbie’s place. Frisbie’s apartment was downtown, in a richer section of the city, and since we were there anyway, we went to lunch. There he was silent, taciturn, evasive. I had seen this before, in other men, and I understood it now. He lacked the capacity to understand the person in front of him. He groped blindly in the dark. His solution was to alight on subjects he imagined we both had in common. The difficulty was he used language as a means to communicate the past day’s reading of online news, aggregators, social media. So he used the language of what he had read, spoke in memes, witless aphorisms (this in contrast with the prepared remarks he used to break lulls at parties, that only seemed witty, but repeat contact with the man proved them otherwise).', 1699919329, '/uploads/shades.png', 'PENDING'),
    (1, '469', 'Sidewalk', 'I saw something strange a few months ago in the newspaper. A man had died. And instead of a single paid obituary he had nearly a dozen. Hundreds of lines, and this was in The New York Times, where obituaries cost over $250 for the first four lines and around $50 for every subsequent line. I counted and there must have been over $5000 spent on his obituaries. They were from various Charitable Organizations, all full of encomia, high praise for this philanthropist, Eugene Grant. The longest of the obituaries ran for an entire column, dozens of lines, a two thousand dollar obituary. It was a recapitulation of his life. How he had changed his name from Greenfeld, gone into real estate, become a philanthropist.

And I tell you all of this because near the bottom of that obituary was a quote of his that I have found worth repeating. It said he believed there were three things that made a good and full life: to find and do something meaningful, to be a member of your community, and to give love.

Which is more or less why I’ve decided to become a tree.

I am always staring at the trees in my yard, the branches and their leaves. The giving trees, the taking-it trees, the redwoods and magnolias, the japanese maple. I understand now I have been preparing to become a tree for years. When I was young and our class forced to do school plays by our teacher I was always chosen, out of some thirty or more students, to be inanimate. I have played desks and chairs and rocks, but above all, trees. I have spread my arms and let green and yellow crayon-colored paper leaves dangle there for minutes while all about me quick-moving children misspoke their lines. I remember feeling ancient even then. Life came to me in seasons. I carved air with sunlight, drew myself up from the earth, communed with vast networks of roots and fungi, underground skeins of thought. And I know what I am. A redwood in a redwood forest, surrounded by my community of trees and more, a solar-powered carbon sequestration natural wonder, home for thousands. Feeding by the sugarload all the fungi beneath my trunk. Trading, storing, abiding, shaking. And after a thousand years have passed I will return to my old self, renounce my roots, see once more the world through human eyes. See how far we have come, and gone, if the Moon is criss-crossed by human settlement. If Mars too is settled, its moons, what life there might be on Europa, on Titan. Or life still stranger yet, flowers of ice and rock to focus sunlight in the Oort cloud, drawing vital energy even at that improbable distance. And farther yet into other systems. Taking a starship there. I think I’d like that very much. To see worlds and skies other than these.
', 1699919420, '/uploads/sidewalk_needs_edging.png', 'COMPLETED'),
    (1, 'West building', 'Bathroom/living room', 'Page 660 waited three years to be read. In that time it went from paper mill to warehouse to bookstore to bookshelf to used bookstore. It learned all this from pages 659 and 661, who themselves learned it from 658 and 662 all the way forward and back to the front and back covers. They saw the teddy-bear faced used bookstore owner who arrived promptly at 7:30am every morning, stayed until 6:30pm, they saw the high school students, who worked at his bookstore from 3pm to 6pm. Everything they learned they passed on to the inner pages, to the signatures and leafs, who passed it on in a multi-hundred page game of telephone (occasionally skipping blank pages), each page interpreting as well as it could based on what it knew, which, more or less, consisted of the some three hundred words it contained. Some pages then, near the end of the book, were, at first, illiterate. Others by dint of their confined vocabulary espoused strange theories of the world, often self-allotting confidence in proportion to their ignorance.

But the book as a whole was wise, intelligent, well read, or the product of someone well read, though even they had a hard time imagining they had been written by some intelligent designer. It seemed rather they had simply sprung out of some primordial pulp, fully formed and literate, a bound union of words, individually knowing quite little, but together having an inordinate knowledge of the world. The tragedy then, as page 660 was the first to discover, was that the world they had conceived for themselves in their own words, was very unlike the unbound world. Here beyond their borders were creatures who moved independently, whose binding, if they were bound, whose words, if they had any, were secreted away and unopenable, illegible. They spoke and they wrote and it took the book a long time to learn how exactly this had occurred. This sundering of book and creature, as if far back in time they had coincided in a single point, and only now as the universe cooled found themselves differentiated into something a little more complex. This epiphany, or knowledge, coming from a nearby Cosmology Textbook on the shelf next to them, settled there by geometric coincidence and the inevitable squeeze of a used book store with the cities rising rent prices and acquisitive landlords, their faces frozen into perpetual $ _ $, price per square foot rising from cents to multiple dollars, doubling, then tripling, and the used bookstores getting ever smaller, bookshelves rising to the ceilings, walkways narrowing, the wondrous sprawl of fiction eliding with increasingly esoteric subgenres of creative nonfiction.', 1699919426, '/uploads/hot_tap_not_working.png', 'PENDING')
;


-- SELECT * FROM users;
-- SELECT * FROM requests;
