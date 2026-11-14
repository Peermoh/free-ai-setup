import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL_FRAMES} from './config';
import {Video} from './Video';
import {Simple} from './simple/Simple';
import {ThreeFilm} from './three/ThreeFilm';
import {Blueprint, TOTAL_SECONDS as BP_SECONDS} from './three/Blueprint';
import {ThemePreview} from './preview/ThemePreview';
import {Themes} from './preview/Themes';
import {WireframeTheme} from './preview/Wireframe';
import {Constellation} from './preview/Constellation';
import {Typography} from './preview/Typography';
import {Style2} from './preview/Style2';
import {KaggleTest} from './preview/KaggleTest';
import {Keyframes} from './keyframes/Keyframes';
import {StyleSample} from './flat/StyleSample';
import {FlatScenes} from './flat/Scenes';
import {FlatFilm, FLAT_TOTAL} from './flat/Film';

/**
 * Two compositions, same scenes:
 *   LinkedInSquare 1080x1080 - the LinkedIn feed on phones
 *   Landscape      1920x1080 - YouTube or slides
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Simple"
      component={Simple}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Portrait"
      component={Video}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Blueprint"
      component={Blueprint}
      durationInFrames={Math.round(BP_SECONDS * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Three"
      component={ThreeFilm}
      durationInFrames={24 * 30}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition id="Flat" component={FlatFilm} durationInFrames={FLAT_TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="FlatScenes" component={FlatScenes} durationInFrames={10} fps={FPS} width={1080} height={1920} />
    <Composition id="FlatSample" component={StyleSample} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{theme: 'dark' as const}} />
    {/* One still per beat: frame N = beat N. Review these before animating. */}
    <Composition id="Keyframes" component={Keyframes} durationInFrames={10} fps={FPS} width={1080} height={1920} />
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
