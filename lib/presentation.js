import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Deck, Slide } from 'spectacle';
import preloader from 'spectacle/lib/utils/preloader';


/**
 * PropType helper to ensure only certain component(s) are used as children.
 */
const ofComponent = (...types) => (props, propName, componentName) => {
  const prop = props[propName];
  const error = React.Children
    .map(prop, child => types.includes(child.type))
    .some(v => v === false);

  if (error) {
    const names = types.map(t => `${t.name}`);
    return new Error(
      `Only [${names}] are allowed as children for component "${componentName}".`
    );
  }
};


/**
 * Small wrapper for Spectacle that combine availble configuration and
 * has some sensible defaults.
 */
export const Presentation = ({
  children,
  theme,
  progress='none',
  transition=['fade'],
  transitionDuration=200
}) => (
    <Deck theme={theme} progress={progress} transition={transition} transitionDuration={transitionDuration}>
      {children}
    </Deck>
);

Presentation.propTypes = {
  children: ofComponent(Slide),
  theme: PropTypes.object,
  progress: PropTypes.string,
  transition: PropTypes.arrayOf(PropTypes.string),
  transitionDuration: PropTypes.number
};


/**
 * Custom render method, so users don't' have to know
 * the identiy of mounted root element. Also preloads
 * passed `images`.
 */
export const present = (Root, images) => {
  preloader(images);
  render(<Root />, document.getElementById('root'));
};
export default present;