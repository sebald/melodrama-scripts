import React from 'react';
/**
 * For a complete API document please
 * refer to https://github.com/FormidableLabs/spectacle#tag-api
 */
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

/**
 * Import and create the theme you want to use.
 */
import createTheme from 'spectacle/lib/themes/default';
const theme = createTheme({});

/**
 * Import/require your images and add them to `images`
 * for easy access and preloading.
 */
const images = {};

/**
 * Add your slides! :-)
 */
const Root = () => (
  <Presentation theme={theme}>
    <Slide>
      <Heading>Title</Heading>
    </Slide>
  </Presentation>
);

render(Root, { images });