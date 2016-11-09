import React from 'react';
// For a complete API docs see https://github.com/FormidableLabs/spectacle#tag-api
import {
  Slide, Appear,
  Layout, Fill, Fit,
  Heading, Text, Link, S, Markdown,
  List, ListItem,
  Table,  TableItem, TableHeaderItem, TableRow,
  BlockQuote, Quote, Cite,
  Code, CodePane,
  Image
} from 'spectacle';
import render, { Presentation } from 'melodrama';

// --- THEME ---
// Import and create the theme you want to use.
import createTheme from 'spectacle/lib/themes/default';
const theme = createTheme({});

// --- SYNTAX HIGHLIGHTING ---
// import 'prismjs/components/prism-core';
// import 'prismjs/components/prism-clike';
// import 'prismjs/components/javascript';

// --- IMAGES ---
// Import/require your images and add them to `images`
// for easy access and preloading.
const images = {};

// --- PRESENTATION ---
const Root = () => (
  <Presentation theme={theme}>
    <Slide>
      <Heading>Title</Heading>
    </Slide>
  </Presentation>
);

render(Root, { images });