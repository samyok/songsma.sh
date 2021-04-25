# SongSmash
![](songsmash.png)

Is VR too expensive? Use your webcam to smash your favorite songs!

Try it out at [song.smash](https://songsma.sh)!

### How we built it

### Features
* Using the power of Artificial Intelligence, control your hands on-screen with only your webcam.
* A database of over 1500 of your favorite songs on custom user-created beatmaps!
* Play or with your friends in a head-to-head battle format, or play to beat your own high score.

### Inspiration
As with many others, during this unprecedented time we've faced a lack of physical activity - often being stuck at home, in bed or at our desks. With **SongSmash**, now you're able to stay fit without leaving your desk.

In a Beat Saber-like style, swipe and hack at incoming blocks while jamming to your favorite songs!

### Challenges we ran into

SongSmash was a challenging project for all of us, and this was the first time we had used many of the technologies. 

* Originally, we had planned for the entire game to use a 3D hand tracking system, which would interpret your arm as a saber. This idea was later scrapped, as it was simply far too difficult to implement smooth motion in three directions and rotation in three axes.
* There were many iterations of inaccurate webcam tracking before we up with what we have now. As this was an essential part of our project, we had to make sure that the tracking worked as perfectly as possible without making it too resource-intensive.
* We discovered that smooth motion and rotation is incredibly difficult. As the AI can be inaccurate, we needed to make sure that any moments of inaccuracy would not result in a jumpy cursor.
* The 3D animation was also very difficult, and errors often game up when rendering the scene. We ended up using a wide variety of effects such as transparency and particle effects to create the correct "feel" of the game that we wanted. For all of us, it was our first time using three.js.
* Generating the models for the boxes took a lot of time, since none of us really knew how to use blender or do any 3D modeling at all. It was a big learning curve but eventually we were able the get the boxes and sabers to look convincing.
* Lag reduction was a large part of our development plan. This was important to us because many people have different computers, and some of them may be more powerful than others. Since this game was very intensive on RAM, the game would often lag if played at too high a frame rate.

### Accomplishments we're proud of

* Use artificial intelligence to track one's webcam quickly and reliably.
* We used three.js successfully, even if none of us had used it before. We were able to make the lighting and special effects better than we had imagined was possible!
* We had a fully functioning database of over 1500 songs, along with a search function! You're able to play beatmaps of varying difficulties as well.

### What we learned


### What's next?
* 3-4 player multiplayer support
* Public room search and player matching
* Customizable games - for instance, song speed and difficulty levels
 

### Source

:electron: [song.smash](https://songsma.sh)
:octocat: Github: https://github.com/samyok/songsma.sh
