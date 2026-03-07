import { Audio, Composition, Sequence, staticFile } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { HomeScene } from './scenes/HomeScene';
import { AIChatScene } from './scenes/AIChatScene';
import { MealScene } from './scenes/MealScene';
import { WorkoutScene } from './scenes/WorkoutScene';
import { MoodScene } from './scenes/MoodScene';
import { RewardsScene } from './scenes/RewardsScene';
import { InsightsScene } from './scenes/InsightsScene';
import { ClosingScene } from './scenes/ClosingScene';
import { SceneTransition } from './components/SceneTransition';
import { FPS, WIDTH, HEIGHT, SCENES } from './constants';

// Overlap duration in frames for crossfade between scenes
const OVERLAP = 15;

const scenes = [
  { key: 'intro', Scene: IntroScene, audio: 'intro' },
  { key: 'home', Scene: HomeScene, audio: 'home' },
  { key: 'aiChat', Scene: AIChatScene, audio: 'aiChat' },
  { key: 'mealAnalysis', Scene: MealScene, audio: 'mealAnalysis' },
  { key: 'workoutCoach', Scene: WorkoutScene, audio: 'workoutCoach' },
  { key: 'moodTracker', Scene: MoodScene, audio: 'moodTracker' },
  { key: 'rewards', Scene: RewardsScene, audio: 'rewards' },
  { key: 'insights', Scene: InsightsScene, audio: 'insights' },
  { key: 'closing', Scene: ClosingScene, audio: 'closing' },
] as const;

const DemoVideo: React.FC = () => {
  return (
    <>
      {scenes.map(({ key, Scene, audio }) => {
        const timing = SCENES[key as keyof typeof SCENES];
        // Start earlier by OVERLAP frames (except first scene)
        const startFrame = timing.start * FPS;
        const durationFrames = timing.duration * FPS + OVERLAP;

        return (
          <Sequence
            key={key}
            from={startFrame}
            durationInFrames={durationFrames}
            name={key}
          >
            <SceneTransition>
              <Scene />
            </SceneTransition>
            <Audio src={staticFile(`audio/${audio}.mp3`)} />
          </Sequence>
        );
      })}
    </>
  );
};

const totalFrames =
  SCENES.closing.start * FPS + SCENES.closing.duration * FPS + OVERLAP;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WellEarnedDemo"
        component={DemoVideo}
        durationInFrames={totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
