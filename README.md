# M'Fing Dots on a M'Fing Grid

Is a fxhash speedrun any% < 720 minutes project. Started at 10:30am Fri 5th August 2022, and finished at 10:30pm Fri 5th August 2022.

You can see it running over here: https://revdancatt.github.io/mfing-dots-on-a-mfing-grid/

My fxhash profile is [here](https://www.fxhash.xyz/u/revdancatt), I will add a link to the project when it launches. You can find me on twitter [@revdancatt](https://twitter.com/revdancatt).

![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/MFing_Dots_on_a_MFing_Grid_oo2uAjGpRnfnLrnPDAcFTwtgNecR8Mvpgd5UfQ5AU1ahPoTVcLr.jpg "Sample Dots")

## SPEED RUN

The tradition of doing a "speed run" on [fxhash](https://www.fxhash.xyz/) was started by [Alexis André](https://twitter.com/mactuitui) and his "[fxhash SpeedRun: any% < 960 minutes](https://www.fxhash.xyz/generative/11995)" project, described as "_A performance piece. From cloning the template to a decent piece in less than 960 minutes_". 

Two more speed run collections have been created "[Consequence Broadcast](https://www.fxhash.xyz/generative/slug/consequence-broadcast-speed-run)" and "[Beacon](https://www.fxhash.xyz/generative/slug/beacon)" both by [Amy Goodchild](https://twitter.com/amygoodchild).

This is a `fxhash speedrun any% < 720` run.

The `any%` is from game speed running and means "to get to the end with any % finished", meaning you don't have to 100% complete the game, just get to the end credits. For a gen art project it means you can use libraries and copy bits and bobs from your previous code, without having to do everything from scratch.

`< 720` means that it's done in less than 720 minutes, in this case 12 hours.

## THIS PROJECT

This piece is generally based on Damien Hirst spots, with his simple rule of no exact colour more than once, but I totally broke that rule, of course.

The idea behind the project was to take one of the simplest things in generative art, randomly coloured dots on a grid.

Many projects use dots on a grid as the base foundation for building more complexity. However, just the dots themselves are often considered too simple to have as a project on their own.

Given the limited amount of time for a 12-hour speed run, I decided to see if I could take something as simple as dots and inject just a little bit of GenArt personality into it. The first step was to add some variation to the shape of the dots.

Instead of using the circle/arc function of the canvas, the dots are built from several circles, themselves composed of many points. Doing this allows me to shuffle and displace those points (based on a noise function) to add distortion to each dot. Sometimes a lot, and sometimes none at all. More points are used on the outer rings than the inner ones to improve performance.

Sometimes the circles are broken and turned into part of a spiral.

Once the shape is established, colours are assigned to each dot and adjusted into three "layers"—a dark, medium and light layer. To add texture and depth to each dot, not all circles are drawn in each layer.

A number of strategies are used to assign colours to the dots. Usually, the dots are divided into one, two or three "buckets" that have a range of colours assigned to them, but there are a couple of special cases for colours.

Other effects are added to the dots; sometimes, the size of the dots can be variable, and sometimes, the positions are shuffled a little.

A more extreme shuffle can be applied to the dots, as well as viewing them from slightly further out (adding a margin to the image).

Finally, rarely special shapes other than circles will be used for the "dots".

By doing this, I've hopefully done more than "simple dots on a grid" but kept the essence of just that in place.

## SAMPLE OUTPUTS

### Single colour strategy
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/single.jpg "Single")

### Duo colour strategy
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/due.jpg "Duo")

### Tri colour strategy
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/tri.jpg "Tri")

### Black dots
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/black-dots.jpg "Black dots")

### Off gird
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/offgrid2.jpg "Offgird")

### Squares
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/squares.jpg "Squares")

### Hexagons
![Sample dots](https://raw.githubusercontent.com/revdancatt/mfing-dots-on-a-mfing-grid/master/sample-outputs/hexagons.jpg "Hexagons")

