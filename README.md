# Text Sequence Diagram

A cross platform tool for drawing UML sequence diagram in simple text.

### Snapshot

![main_ui](https://github.com/echoma/text_sequence_diagram/wiki/img/index.png)

![render_ui](https://github.com/echoma/text_sequence_diagram/wiki/img/render.png)

### Features

* Simple pure text syntax to draw beautiful sequence diagram.
* Cross platform, given by [**nw.js**](http://nwjs.io/) and HTML5.
* Adjust the diagram view size and zoom ratio as you wish.
* You can integrate the "text to diagram" library to your own application. See [example_integeration.html](https://github.com/echoma/text_sequence_diagram/blob/master/example_integeration.html) for more detail.

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