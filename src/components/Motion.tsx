import React from 'react';
import {
  motion as motionLib,
  AnimatePresence as AnimatePresenceLib,
} from 'motion/react';
import type { AnimatePresenceProps } from 'motion/react';

const IS_TEST = import.meta.env.MODE === 'test';

/**
 * Environment-aware motion abstraction.
 *
 * In test mode (JSDOM / Vitest), motion components are replaced with plain
 * HTML elements that accept — and silently ignore — animation props.
 * AnimatePresence becomes a simple passthrough fragment.
 *
 * This eliminates the need for IS_TEST conditional render branches in
 * component JSX, keeping a single source of truth for the render tree.
 */

/** Known motion-specific prop keys that must be stripped for plain elements. */
const MOTION_PROP_KEYS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'whileDrag',
  'layout',
  'layoutId',
  'variants',
  'onAnimationStart',
  'onAnimationComplete',
]);

function stripMotionProps(props: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!MOTION_PROP_KEYS.has(key)) {
      cleaned[key] = props[key];
    }
  }
  return cleaned;
}

function createPlainElement(tag: string) {
  const Component = React.forwardRef<HTMLElement, Record<string, unknown>>(
    (props, ref) => React.createElement(tag, { ...stripMotionProps(props), ref })
  );
  Component.displayName = `Plain.${tag}`;
  return Component;
}

const plainMotion = {
  div: createPlainElement('div'),
  main: createPlainElement('main'),
  section: createPlainElement('section'),
  span: createPlainElement('span'),
  p: createPlainElement('p'),
  button: createPlainElement('button'),
  header: createPlainElement('header'),
  footer: createPlainElement('footer'),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const motion: typeof motionLib = IS_TEST ? (plainMotion as any) : motionLib;

const PassthroughAnimatePresence: React.FC<React.PropsWithChildren<AnimatePresenceProps>> = ({ children }) => (
  <>{children}</>
);

export const AnimatePresence = IS_TEST ? PassthroughAnimatePresence : AnimatePresenceLib;
