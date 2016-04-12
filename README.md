# Text Sequence Diagram

A cross platform tool for drawing UML sequence diagram in simple text.

### Features

* Simple pure text syntax to draw beautiful sequence diagram.
* Cross platform, given by [**nw.js**](http://nwjs.io/) and HTML5.
* Adjust the diagram view size as you wish.
* You can integrate the "text to diagram" library to your own application. See [this page](not_implemented) for more detail.

### Syntax

**From** -> **To** : **Note**
or
**From** --> **To** : **Note**

### Example:

* Input:
```
Conn Server -> Safe Domain GW : new order request
Safe Domain GW -> Trade Gateway : authenticated
Trade Gateway -> Logic Control : internal protocol
Logic Control --> Trade Gateway : success response
Trade Gateway --> Safe Domain GW : success response
Safe Domain GW --> Conn Server : response
```

* Output: