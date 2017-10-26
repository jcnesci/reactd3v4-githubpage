// src/components/CountyMap/index.js

// TRICK by Swizek: 
// We export the default import from ./CountyMap.js. That’s it.
// This allows us to import CountyMap from the directory without knowing about internal file structure.
// We could put all the code in this index.js file, but then stack traces are hard to read.
// Putting a lot of code into <directory>/index.js files means that when you’re looking at a stack trace, or opening different source files inside the browser, they’re all going to be named index.js. Life is easier when components live inside a file named the same as the component you’re using.
export { default } from './CountyMap';

