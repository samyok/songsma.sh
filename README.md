# SongSmash
![](songsmash.png)

Is VR too expensive? Use your webcam to smash your favorite songs!

Try it out at [songsma.sh](https://songsma.sh)!

### How we built it

All of the 3D animations in-game were done with three.js. The UI was built with React and node.js. Models of the boxes and hands were made in Blender. ParticlesJS was used to make the particle effects in the background, and PoseTrack was used to track the player's pose on the webcam.

### Features
* Using the power of **artificial intelligence**, control your hands on-screen with only your webcam and wrists!
* Access to a database of over **500** of your favorite songs on custom user-created beatmaps!
* Play or with your friends in a **head-to-head** battle format, or play to beat your own high score!

### Inspiration
As with many others, during this unprecedented time we've faced a lack of physical activity - often being stuck at home, in bed or at our desks. With **SongSmash**, now you're able to stay fit without needing to buy a whole VR headset or even leave your room. 

In a Beat Saber-like style, swipe and hack at incoming blocks while jamming to your favorite songs!

### Challenges we ran into

SongSmash was a challenging project for all of us, and this was the first time we had used many of the technologies. In addition, it was the first hackathon that we've participated in for half the members of our team.

* Originally, we had planned for the entire game to use a 3D hand tracking system, which would interpret your arm as a saber. This idea was later scrapped, as it was simply far too difficult to implement smooth motion in three directions and rotation in three axes. As the AI can be inaccurate, we needed to make sure that any moments of inaccuracy would not result in a jumpy cursor.
* There were many iterations of inaccurate webcam tracking before we up with what we have now. As this was an essential part of our project, we had to make sure that the tracking worked as perfectly as possible without making it too resource-intensive.
* For all of us, it was our first time using three.js. The 3D animation was very difficult, and errors often game up when rendering the scene. We ended up using a wide variety of effects such as transparency and particle effects to create the correct "feel" of the game that we wanted. 
* Generating the models for the boxes also took a lot of time, since none of us really knew how to use Blender or do any 3D modeling at all. It was a big learning curve, but eventually we were able the get the boxes and on-screen hands to look convincing.
* Lag reduction was a large part of our development plan. This was important to us because many people have different computers, and some of them may be more powerful than others. Since this game was very intensive on RAM, the game would often lag if played at too high a frame rate.
* ~~Lack of sleep~~

### Accomplishments we're proud of

* Use artificial intelligence to track one's webcam quickly and reliably.
* Used three.js successfully, even if none of us had used it before; we were able to make the lighting and special effects better than we had imagined was possible!
* A fully functioning database of over 500 songs of varying difficulties
* 1v1 multiplayer games!

### What we learned

This project was easily the most difficult project that all of us had ever made, but we learned a lot about different technologies that made this project possible. Before the project, none of us had any experience in 3D animations in JavaScript, pose tracking and AI, as well as 3D modeling using Blender. This project taught us all a lot in all of these aforementioned technologies, and learning them took up a lot of our time.

### What's next?
* 3-4 player multiplayer support
* Public room search and player matching
* Customizable games - for instance, song speed and difficulty levels
* 3D animations, rather than 2D point animations

### Source

:electron: [songsma.sh](https://songsma.sh)
:octocat: Github: https://github.com/samyok/songsma.sh
