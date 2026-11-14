import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL_FRAMES} from './config';
import {Video} from './Video';
import {ThemePreview} from './preview/ThemePreview';
import {Themes} from './preview/Themes';
import {WireframeTheme} from './preview/Wireframe';
import {Constellation} from './preview/Constellation';
import {Typography} from './preview/Typography';
import {Style2} from './preview/Style2';
import {KaggleTest} from './preview/KaggleTest';

/**
 * Two compositions, same scenes:
 *   LinkedInSquare 1080x1080 - the LinkedIn feed on phones
 *   Landscape      1920x1080 - YouTube or slides
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LinkedInSquare"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Landscape"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* Not part of the film: sample frames for reviewing the look. */}
    <Composition
      id="ThemePreview"
      component={ThemePreview}
      durationInFrames={120}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Themes"
      component={Themes}
      durationInFrames={90}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Wireframe"
      component={WireframeTheme}
      durationInFrames={60}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Constellation"
      component={Constellation}
      durationInFrames={120}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Typography"
      component={Typography}
      durationInFrames={90}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="KaggleTest"
      component={KaggleTest}
      durationInFrames={60}
      fps={FPS}
      width={1080}
      height={1080}
    />
    <Composition
      id="Style2"
      component={Style2}
      durationInFrames={120}
      fps={FPS}
      width={1080}
      height={1080}
    />
  </>
);
