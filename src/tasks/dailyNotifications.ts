import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export const DAILY_CHECK_TASK = 'wellearned-daily-check-task';

const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const daysBetween = (a: Date, b: Date) => {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const hasLogOnDate = (items: any[], key: string) => items.some((x) => String(x.timestamp || '').slice(0, 10) === key);

TaskManager.defineTask(DAILY_CHECK_TASK, async () => {
  try {
    const user = auth.currentUser;
    if (!user) return BackgroundFetch.BackgroundFetchResult.NoData;

    const firstName = (user.displayName || 'there').split(' ')[0];
    const now = new Date();
    const uid = user.uid;
    const today = dayKey(now);

    const [mealsSnap, workoutsSnap, moodsSnap] = await Promise.all([
      getDocs(query(collection(db, 'users', uid, 'meals'), orderBy('timestamp', 'desc'), limit(40))),
      getDocs(query(collection(db, 'users', uid, 'workouts'), orderBy('timestamp', 'desc'), limit(40))),
      getDocs(query(collection(db, 'users', uid, 'moods'), orderBy('timestamp', 'desc'), limit(40))),
    ]);

    const meals = mealsSnap.docs.map((d) => d.data());
    const workouts = workoutsSnap.docs.map((d) => d.data());
    const moods = moodsSnap.docs.map((d) => d.data());

    const notifications: string[] = [];

    const hour = now.getHours();
    const minute = now.getMinutes();

    if ((hour > 13 || (hour === 13 && minute >= 30)) && !hasLogOnDate(meals, today)) {
      notifications.push('📸 Snap your lunch! Log it to keep your streak alive.');
    }

    const lastWorkout = workouts[0]?.timestamp ? new Date(workouts[0].timestamp) : null;
    if (!lastWorkout || daysBetween(now, lastWorkout) >= 3) {
      notifications.push('💪 Your body misses you. 10 min counts — log a workout.');
    }

    if ((hour >= 20) && !hasLogOnDate(moods, today)) {
      notifications.push('🧠 How are you feeling today? A 10-second check-in keeps your streak going.');
    }

    let streak = 0;
    while (streak < 60) {
      const d = new Date(now);
      d.setDate(now.getDate() - streak);
      const key = dayKey(d);
      const complete = hasLogOnDate(meals, key) && hasLogOnDate(workouts, key) && hasLogOnDate(moods, key);
      if (!complete) break;
      streak += 1;
    }

    if (streak > 6) {
      const nextMilestone = streak < 14 ? 14 : streak < 30 ? 30 : streak + 10;
      notifications.push(`🔥 ${streak}-day streak! You're ${Math.max(nextMilestone - streak, 0)} days from your next SKR bonus.`);
    }

    for (const body of notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hey ${firstName}`,
          body,
        },
        trigger: null,
      });
    }

    return notifications.length ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerDailyNotificationTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(DAILY_CHECK_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(DAILY_CHECK_TASK, {
      minimumInterval: 60 * 60 * 24,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
