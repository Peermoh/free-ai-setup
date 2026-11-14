// Remotion render defaults. See https://www.remotion.dev/docs/config
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
// Chromium is pre-installed in this environment; harmless elsewhere.
Config.setChromiumDisableWebSecurity(false);
