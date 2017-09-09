# Text Sequence Diagram

A cross platform tool for drawing UML sequence diagram in simple text.

### Pre-built Executables Download

Download page: [Download](https://github.com/echoma/text_sequence_diagram/wiki/Download)

Latest release date: 2017-09-07

### Online Version

You can also goto [http://echoma.github.io/text_sequence_diagram/](http://echoma.github.io/text_sequence_diagram/) for an online web-app.

> This online version can not export diagram image as pre-built executables.

### Snapshot

![main_ui](https://media.githubusercontent.com/media/echoma/lfs/master/text_sequence_diagram/img/index.png)

![render_ui](https://media.githubusercontent.com/media/echoma/lfs/master/text_sequence_diagram/img/render.png)

### Features

* Simple pure text syntax to draw beautiful sequence diagram.
* Export diagram image to local file.
* Save/open diagram source text to/from local file. Drag and drop supported for opening file.
* Cross platform, given by [**nw.js**](https://github.com/nwjs/nw.js) and HTML5.
* Adjust the diagram view size and zoom ratio as you wish.
* You can integrate the "text to diagram" library to your own application. See [example_integeration.html](https://github.com/echoma/text_sequence_diagram/blob/master/example_integeration.html) for an very simple example.

### Syntax

* Title and Author and so on
```scala
Title @ v1.0 @ 20160415 @ Author
Title @ @ @ Author
```

* Message
```scala
From Object -> To Object : Message Content
```

* Return Message
```scala
From Object --> To Object : Message Content
```

* Self Message
```scala
Object : Message Content
```

* Bottom Description
```scala
[ Bottom Description Line 1 ]
[ Bottom Description Line 2 ]
```

* Comment
```scala
# Comment Line
# Another Comment Line
```

* Example:
```scala
Conn Server -> Safe Domain GW : single order request
Safe Domain GW -> Trade Gateway : authenticated
Trade Gateway -> Logic Control : internal protocol
Logic Control --> Trade Gateway : success response
Trade Gateway --> Safe Domain GW : success response
Safe Domain GW --> Conn Server : response
```

### Adavanced Syntax

Thanks to [@Phy25](https://github.com/phy25)

* Self Message with dash link
```scala
Object :: Message Content
```

* Continuous life-line

In the text, add `^` before the broker object.

As the following example shows, watch the `^` before `A` in the 4th line.

```scala
A -> B: msg-1
B -> C: msg-2
C -> B: msg-3
B -> ^A: msg-4
```

![adv](https://media.githubusercontent.com/media/echoma/lfs/master/text_sequence_diagram/img/adv.png)