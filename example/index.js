import React from 'react';
import { Slide } from 'spectacle';
import createTheme from 'spectacle/lib/themes/default';
import render, { Presentation } from 'melodrama';
import External from './external';

const images = {
  nyan: require('./nyancat.gif')
};

const Root = () => (
  <Presentation theme={createTheme({})}>
    <Slide>
      <External/>
    </Slide>
    <Slide>
      Second Slide
    </Slide>
    <Slide bgImage={images.nyan}></Slide>
    <Slide>The End</Slide>
  </Presentation>
);

render(Root, images);